const { app, input, output } = require('@azure/functions');
const { Configuration, PlaidApi, Products, PlaidEnvironments, CraCheckReportProduct } = require('plaid');

const sqlInputGeneralLedger = input.sql({
    commandText: `select [TransactionID], [Date], [Description], [Amount], [Category], [Platform], [LinkedAccount], [CreatedAt] from dbo.GeneralLedger where (Date >= @StartingDate And Date <= @EndingDate)`,
    commandType: 'Text',
    parameters: '@StartingDate={startingDate:date},@EndingDate={endingDate:date}',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('generalledger', {
    route: "generalledger/{startingDate}/{endingDate}",
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
    commandText: 'select [PayoutID], [EmployeeName], [AmountPaid], [PaymentDate], [CreatedAt] from dbo.PayoutLog',
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
    commandText: 'SELECT [Month], [Revenue], [Expenses], [NetProfit] FROM dbo.IOStatement',
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
const sqlInputRevenue = input.sql({
    commandText: 'SELECT [Date], [Amount], [Category] FROM dbo.Revenues',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('revenue', {
    route: "revenue",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputRevenue],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const revenue = context.extraInputs.get(sqlInputRevenue);
        return {
            jsonBody: { revenue },
        };
    },
});
const sqlInputExpenses = input.sql({
    commandText: 'SELECT [Date], [Amount], [Category], [CreatedAt] FROM dbo.Expenses',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('expenses', {
    route: "expenses",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputExpenses],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const expenses = context.extraInputs.get(sqlInputExpenses);
        return {
            jsonBody: { expenses },
        };
    },
});
//https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-azure-sql-input?tabs=isolated-process%2Cnodejs-v4%2Cpython-v2&pivots=programming-language-javascript#http-trigger-get-row-by-id-from-query-string-3
const sqlOutputCategoryUpdate = output.sql({
    //type: 'sql',
    commandText: `dbo.GeneralLedger`,
    /*
    UPDATE dbo.GeneralLedger SET Category = @NewCategory WHERE TransactionID = @TransactionID
    MERGE INTO dbo.GeneralLedger DUAL 
          on(TransactionID = @TransactionID)
          WHEN MATCHED THEN 
              UPDATE SET Category = @NewCategory;
    MERGE INTO dbo.GeneralLedger AS TARGET 
  USING (SELECT * FROM dbo.GeneralLedger WHERE TransactionID = @TransactionID) AS SOURCE 
  on(Source.TransactionID = Target.TransactionID)
  WHEN MATCHED THEN 
    UPDATE SET Category = @NewCategory;
    */
    //commandType: 'Text',
    //parameters: '@NewCategory={newCategory:alpha},@TransactionID={transactionId:int}',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,
///{transactionId}/{newCategory}
app.http('updatecategory', {
    route: "updatecategory",
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [sqlOutputCategoryUpdate],
    handler: async (request, context) => {
        const body = await request.json();
        context.log('HTTP trigger and SQL input binding function processed a request.');
        context.extraOutputs.set(sqlOutputCategoryUpdate, body);
        return {
            status: 201,
            jsonBody: { parameters: request.params },
        };
    },
});

const sqlInputNeedsRelinkList = input.sql({
    commandText: 'SELECT [ID], [UserID], [BankName], [AccessToken], [ItemID], [NeedsRelink] FROM dbo.UserBankTokens WHERE UserID = 1 AND NeedsRelink = 1',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('needsrelinklist', {
    route: "needsrelinklist",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputNeedsRelinkList],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const needsRelinkList = context.extraInputs.get(sqlInputNeedsRelinkList);
        return {
            jsonBody: { needsRelinkList },
        };
    },
});

const configuration = new Configuration({
    basePath: 'https://production.plaid.com',//PlaidEnvironments.production,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET
        },
    },
});

const client = new PlaidApi(configuration);

app.http('get_link_token', {
    route: "get_link_token",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        context.log('HTTP trigger and SQL input binding function processed a request.');

        var createTokenResponse = null;
        var error = null
        const getError = (error) => {
            let e = error;
            if (error.response) {
                e = error.response.data;                   // data, status, headers
                if (error.response.data && error.response.data.error) {
                    e = error.response.data.error;           // my app specific keys override
                }
            } else if (error.message) {
                e = error.message;
            } else {
                e = "Unknown error occured";
            }
            return e;
        };
        try {
            createTokenResponse = await client.linkTokenCreate(
                {
                    user: {
                        // This should correspond to a unique id for the current user.
                        client_user_id: 1,
                    },
                    client_name: 'NuCulture',
                    products: ["transactions"],//Products.Transactions
                    country_codes: ['US', 'CA'],
                    language: 'en',
                    redirect_uri: body.referer
                });
        } catch (e) {
            error = getError(e)
        }

        return {
            status: 201,
            jsonBody: error ? error : createTokenResponse.data,
        };
    },
});

app.http('get_access_token', {
    route: "get_access_token",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        context.log('HTTP trigger and SQL input binding function processed a request.');

        const tokenResponse = await client.itemPublicTokenExchange({
            public_token: body.public_token,
        });

        return {
            status: 201,
            jsonBody: tokenResponse.data,
        };
    },
});

const sqlInputUserBankTokens = input.sql({
    commandText: 'SELECT [ID], [UserID], [BankName], [AccessToken], [ItemID], [NeedsRelink] FROM dbo.UserBankTokens',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('userbanktokens', {
    route: "userbanktokens",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputUserBankTokens],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const userBankTokens = context.extraInputs.get(sqlInputUserBankTokens);
        return {
            jsonBody: userBankTokens,
        };
    },
});

const sqlOutputUserBankTokenUpdate = output.sql({
    commandText: `dbo.UserBankTokens`,
    connectionStringSetting: "SqlConnectionString"
});
app.http('updateuserbanktoken', {
    route: "updateuserbanktoken",
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [sqlOutputUserBankTokenUpdate],
    handler: async (request, context) => {
        const body = await request.json();
        context.log('HTTP trigger and SQL input binding function processed a request.');
        context.extraOutputs.set(sqlOutputUserBankTokenUpdate, body);
        return {
            status: 201,
            jsonBody: { parameters: request.params },
        };
    },
});
