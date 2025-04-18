const { app, input, output } = require('@azure/functions');

const sqlInputGeneralLedger = input.sql({
    commandText: 'select [TransactionID], [Date], [Description], [Amount], [Category], [Platform], [LinkedAccount], [CreatedAt] from dbo.GeneralLedger',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('generalledger', {
    route: "generalledger",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputGeneralLedger],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const generalLedger = context.extraInputs.get(sqlInputGeneralLedger);
        /*context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: {
                success: true,
                generalLedger: {}
            }
        };*/
        return {
            jsonBody: { generalLedger },
        };
    },
});

const sqlInputPayoutLog = input.sql({
    commandText: 'select [EmployeeName], [AmountPaid], [PaymentDate], [CreatedAt] from dbo.PayoutLog',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('payoutlog', {
    route: "payoutlog",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputPayoutLog],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const payoutLog = context.extraInputs.get(sqlInputPayoutLog);
        return {
            jsonBody: { payoutLog },
        };
    },
});

const sqlInputAccountBalances = input.sql({
    commandText: 'select [AccountName], [CurrentBalance], [LastUpdated] from dbo.AccountBalances',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('accountbalances', {
    route: "accountbalances",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputAccountBalances],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const accountBalances = context.extraInputs.get(sqlInputAccountBalances);
        return {
            jsonBody: { accountBalances },
        };
    },
});

const sqlInputIOStatement = input.sql({
    commandText: 'SELECT [Month], [TotalRevenue], [TotalExpenses], [NetProfit] FROM dbo.IOStatement',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('iostatement', {
    route: "iostatement",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputIOStatement],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const ioStatement = context.extraInputs.get(sqlInputIOStatement);
        return {
            jsonBody: { ioStatement },
        };
    },
});
//https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-azure-sql-input?tabs=isolated-process%2Cnodejs-v4%2Cpython-v2&pivots=programming-language-javascript#http-trigger-get-row-by-id-from-query-string-3
const sqlOutputCategoryUpdate = output.sql({
    commandText: 'UPDATE dbo.GeneralLedger SET Category = @NewCategory WHERE TransactionID = @TransactionID',
    commandType: 'Text',
    parameters: '@NewCategory={newCategory},@TransactionID={transactionId}',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('updatecategory', {
    route: "updatecategory/{transactionId}/{newCategory}",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraOutputs: [sqlOutputCategoryUpdate],
    handler: async (request, context) => {
        //const body = await request.json();
        context.log('HTTP trigger and SQL input binding function processed a request.');
        context.extraOutputs.set(sqlOutputCategoryUpdate);
        return {
            status: 201,
            jsonBody: {},
        };
    },
});
