using System;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace OpportunityPlugins
{
    /// <summary>
    /// Closes all Draft and Active quotes before an opportunity is closed,
    /// so "Close as won" and "Close as lost" no longer fail.
    ///
    /// Register two steps on this class:
    ///   Message: Win  | Entity: opportunity | Stage: PreOperation | Mode: Synchronous | User: Calling User
    ///   Message: Lose | Entity: opportunity | Stage: PreOperation | Mode: Synchronous | User: Calling User
    ///
    /// Behaviour:
    ///   Close as won  -> newest quote = Won, other open quotes = Closed (Canceled)
    ///   Close as lost -> all open quotes = Closed (Lost)
    ///
    /// Security and data protection:
    ///   - Runs as the calling user: Dataverse security roles are enforced, no privilege escalation.
    ///   - Reads only the quote state; no names, amounts, customers or other business data are retrieved.
    ///   - Trace logs contain only counts, the message name and the platform correlation ID.
    ///     No record IDs, names or business values are written to logs.
    ///   - Users see only generic, fixed error messages; technical details are never shown.
    ///   - Parameterized query (QueryExpression): no injection risk.
    ///   - Stateless class (constants only): safe under concurrent use.
    ///   - Runs inside the platform transaction: any failure rolls back everything.
    /// </summary>
    public sealed class CloseQuotesOnOpportunityClose : IPlugin
    {
        // Quote statecode
        private const int StateDraft = 0;
        private const int StateActive = 1;

        // Quote statuscode
        private const int StatusActiveInProgress = 2;
        private const int StatusWon = 4;
        private const int StatusLost = 5;
        private const int StatusCanceled = 6;

        // Safety limits
        private const int MaxQuotes = 50;   // keeps execution well inside the 2-minute sync plugin limit
        private const int MaxDepth = 2;     // 1 = UI/API, 2 = flow or another plugin; deeper = possible loop

        // Fixed messages: never include record data or exception details
        private const string GenericErrorMessage =
            "The related quotes could not be closed. Please contact your administrator.";
        private const string TooManyQuotesMessage =
            "This opportunity has too many open quotes to close automatically. " +
            "Please close some quotes manually, then close the opportunity again.";

        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null) throw new InvalidPluginExecutionException(GenericErrorMessage);

            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));

            if (context == null || factory == null) throw new InvalidPluginExecutionException(GenericErrorMessage);

            // Correlation ID lets an admin match a log entry to a user's error without logging any data
            string correlation = context.CorrelationId.ToString();
            Trace(tracing, $"Start. Message={context.MessageName}, Depth={context.Depth}, Correlation={correlation}");

            // Loop protection
            if (context.Depth > MaxDepth)
            {
                Trace(tracing, "Depth limit exceeded; exiting without changes.");
                return;
            }

            // Only the opportunity entity
            if (!string.Equals(context.PrimaryEntityName, "opportunity", StringComparison.OrdinalIgnoreCase))
            {
                Trace(tracing, "Not an opportunity; exiting.");
                return;
            }

            // Only PreOperation (20): guarantees transaction rollback on failure
            if (context.Stage != 20)
            {
                Trace(tracing, "Not registered on PreOperation; exiting without changes.");
                return;
            }

            // Which button? Close as won -> "Win", Close as lost -> "Lose"
            bool isWin = string.Equals(context.MessageName, "Win", StringComparison.OrdinalIgnoreCase);
            bool isLose = string.Equals(context.MessageName, "Lose", StringComparison.OrdinalIgnoreCase);
            if (!isWin && !isLose) return;

            // Opportunity being closed
            if (!context.InputParameters.Contains("OpportunityClose") ||
                !(context.InputParameters["OpportunityClose"] is Entity oppClose))
            {
                Trace(tracing, "No OpportunityClose input; exiting.");
                return;
            }

            var oppRef = oppClose.GetAttributeValue<EntityReference>("opportunityid");
            if (oppRef == null || oppRef.Id == Guid.Empty)
            {
                Trace(tracing, "No opportunity reference; exiting.");
                return;
            }

            // Calling user's identity: users can only change quotes their security role allows
            var service = factory.CreateOrganizationService(context.UserId);

            try
            {
                // Minimal data: only the state column, only this opportunity's open quotes
                var query = new QueryExpression("quote")
                {
                    ColumnSet = new ColumnSet("statecode"),
                    Criteria =
                    {
                        Conditions =
                        {
                            new ConditionExpression("opportunityid", ConditionOperator.Equal, oppRef.Id),
                            new ConditionExpression("statecode", ConditionOperator.In, StateDraft, StateActive)
                        }
                    },
                    Orders = { new OrderExpression("modifiedon", OrderType.Descending) },
                    TopCount = MaxQuotes + 1,
                    NoLock = false
                };

                var quotes = service.RetrieveMultiple(query).Entities;
                Trace(tracing, $"Open quotes: {quotes.Count}");

                if (quotes.Count == 0) return;

                if (quotes.Count > MaxQuotes)
                {
                    Trace(tracing, "Quote limit exceeded; stopping.");
                    throw new InvalidPluginExecutionException(TooManyQuotesMessage);
                }

                int activated = 0, won = 0, canceled = 0, lost = 0;
                bool isNewest = true;

                foreach (var quote in quotes)
                {
                    // Draft -> Active (required before a quote can be closed)
                    if (quote.GetAttributeValue<OptionSetValue>("statecode")?.Value == StateDraft)
                    {
                        service.Execute(new SetStateRequest
                        {
                            EntityMoniker = new EntityReference("quote", quote.Id),
                            State = new OptionSetValue(StateActive),
                            Status = new OptionSetValue(StatusActiveInProgress)
                        });
                        activated++;
                    }

                    // Quote Close activity: fixed subject text only, no business data
                    var quoteClose = new Entity("quoteclose")
                    {
                        ["quoteid"] = new EntityReference("quote", quote.Id),
                        ["subject"] = isWin ? "Auto-closed: opportunity won" : "Auto-closed: opportunity lost"
                    };

                    if (isWin && isNewest)
                    {
                        // Close as won -> newest quote Won
                        service.Execute(new WinQuoteRequest
                        {
                            QuoteClose = quoteClose,
                            Status = new OptionSetValue(StatusWon)
                        });
                        won++;
                    }
                    else if (isWin)
                    {
                        // Close as won -> other quotes Canceled
                        service.Execute(new CloseQuoteRequest
                        {
                            QuoteClose = quoteClose,
                            Status = new OptionSetValue(StatusCanceled)
                        });
                        canceled++;
                    }
                    else
                    {
                        // Close as lost -> all quotes Lost
                        service.Execute(new CloseQuoteRequest
                        {
                            QuoteClose = quoteClose,
                            Status = new OptionSetValue(StatusLost)
                        });
                        lost++;
                    }

                    isNewest = false;
                }

                Trace(tracing, $"Done. Activated={activated}, Won={won}, Canceled={canceled}, Lost={lost}");
            }
            catch (InvalidPluginExecutionException)
            {
                // Fixed, data-free messages raised above pass through unchanged
                throw;
            }
            catch (Exception ex)
            {
                // Log only the exception type and platform error code: no messages, IDs or stack data
                string errorCode = (ex as System.ServiceModel.FaultException<OrganizationServiceFault>)?.Detail?.ErrorCode.ToString("X") ?? "n/a";
                Trace(tracing, $"Failed. ExceptionType={ex.GetType().Name}, ErrorCode=0x{errorCode}, Correlation={correlation}");
                throw new InvalidPluginExecutionException(GenericErrorMessage);
            }
        }

        // Tracing must never break the business operation
        private static void Trace(ITracingService tracing, string message)
        {
            try { tracing?.Trace(message); } catch { /* ignore */ }
        }
    }
}