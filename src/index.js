const { app, input, output } = require('@azure/functions');
const { Configuration, PlaidApi, Products, PlaidEnvironments, CraCheckReportProduct } = require('plaid');
const sql = require('mssql');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

/*const sqlInputNeedsRelinkList = input.sql({
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
});*/

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
app.http('get_link_token', {
    route: "get_link_token",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        context.log('HTTP trigger and SQL input binding function processed a request.');

        var createTokenResponse = null;
        var error = null
        try {
            createTokenResponse = await client.linkTokenCreate(
                {
                    user: {
                        // This should correspond to a unique id for the current user.
                        client_user_id: "1",
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
            jsonBody: { userBankTokens },
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

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DB,
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    requestTimeout: 240000
};
const fetchPlaidTransactions = async (context) => {
    try {
        const pool = await new sql.ConnectionPool(config)
            .connect()
            .then(pool => {
                console.log("✅ Connected to Azure SQL");
                return pool;
            })
            .catch(err => console.log("❌ SQL Connection Error:", err));
        const result = await pool.request()
            .input('UserID', sql.Int, "1")
            .query("SELECT AccessToken, BankName FROM UserBankTokens WHERE UserID = @UserID AND (NeedsRelink = 0 OR NeedsRelink IS NULL)");
        let totalInserted = 0;
        for (const row of result.recordset) {
            const { AccessToken, BankName } = row;
            let cursor = null;
            let hasMore = true;
            let added = [];
            const cursorResult = await pool.request()
                .input("AccessToken", sql.VarChar, AccessToken)
                .query("SELECT TOP 1 CursorValue FROM PlaidCursors WHERE AccessToken = @AccessToken ORDER BY LastUpdated DESC");
            if (cursorResult.recordset.length > 0)
                cursor = cursorResult.recordset[0].CursorValue;
            while (hasMore) {
                await client.transactionsSync({ access_token: AccessToken, cursor, options: { days_requested: 30 } }).then(sync => {
                    added = added.concat(sync.data.added);
                    cursor = sync.data.next_cursor;
                    hasMore = sync.data.has_more;
                }).catch(async e => {
                    await pool.request()
                        .input("AccessToken", sql.VarChar, AccessToken)
                        .query(`UPDATE UserBankTokens SET NeedsRelink = 1 WHERE AccessToken = @AccessToken`);
                });
            }
            await pool.request()
                .input("AccessToken", sql.VarChar, AccessToken)
                .input("CursorValue", sql.VarChar, cursor)
                .query("DELETE FROM PlaidCursors WHERE AccessToken = @AccessToken; INSERT INTO PlaidCursors (AccessToken, CursorValue) VALUES (@AccessToken, @CursorValue);");
            for (const t of added) {
                const duplicateCheck = await pool.request()
                    .input("Date", sql.Date, t.date)
                    .input("Description", sql.VarChar, t.name)
                    .input("Amount", sql.Decimal(18, 2), -t.amount)
                    .input("LinkedAccount", sql.VarChar, t.account_id)
                    .query(`SELECT 1 FROM GeneralLedger WHERE Date = @Date AND Description = @Description AND Amount = @Amount AND LinkedAccount = @LinkedAccount`);
                if (duplicateCheck.recordset.length === 0) {
                    await pool.request()
                        .input("Date", sql.Date, t.date)
                        .input("Description", sql.VarChar, t.name)
                        .input("Amount", sql.Decimal(18, 2), -t.amount)
                        .input("Platform", sql.VarChar, BankName)
                        .input("LinkedAccount", sql.VarChar, t.account_id)
                        .query(`INSERT INTO GeneralLedger (Date, Description, Amount, Platform, LinkedAccount) VALUES (@Date, @Description, @Amount, @Platform, @LinkedAccount)`);
                    totalInserted++;
                }
            }
        }
        return { jsonBody: { success: true, inserted: totalInserted } };
    } catch (err) {
        context.log(err.message);
        return { status: 500, jsonBody: { err: getError(err) } };
    }
}
const fetchStripeTransactions = async context => {
    try {
        const pool = await new sql.ConnectionPool(config)
            .connect()
            .then(pool => {
                console.log("✅ Connected to Azure SQL");
                return pool;
            })
            .catch(err => console.log("❌ SQL Connection Error:", err));
        // Pull Stripe payments (use your own params if needed)
        const charges = await stripe.charges.list({
            limit: 100, // Max allowed by Stripe
            expand: ['data.customer']
        });
        let totalInserted = 0;
        for (const charge of charges.data) {
            const { created, amount, customer } = charge;
            const date = new Date(created * 1000);
            const convertedAmount = amount / 100;
            const category = customer?.id || null;
            const customerEmail = customer?.email || null;
            // Check for duplicates
            const exists = await pool.request()
                .input('Date', sql.Date, date)
                .input('Amount', sql.Decimal(18, 2), convertedAmount)
                .query(`SELECT 1 FROM dbo.StripeInvoices WHERE Date = @Date AND Amount = @Amount`);
            if (exists.recordset.length === 0) {
                await pool.request()
                    .input('Date', sql.Date, date)
                    .input('Amount', sql.Decimal(18, 2), convertedAmount)
                    .input('CustomerEmail', sql.VarChar, customerEmail)
                    .input('Category', sql.VarChar, category)
                    .query(`INSERT INTO dbo.StripeInvoices (Date, Amount, Category, CustomerEmail) VALUES (@Date, @Description, @Amount, @Platform, @Category, @CustomerEmail)`);
                totalInserted++;
            }
        }
        return { jsonBody: { success: true, totalInserted } };
    } catch (err) {
        context.log("❌ Stripe sync failed:", err.message);
        return { status: 500, jsonBody: { err: getError(err) } };
    }
}
app.timer('unifiedTransactions', {
    schedule: "0 59 23 */3 * *",//0 */5 * * * *
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');
        const today = new Date();
        const dayOfMonth = today.getDate();
        /*if (dayOfMonth % 3 !== 0) {
            context.log(`ℹ️ Skipping sync today (${dayOfMonth}) — not a 3rd day.`);
            return null;
        }*/
        context.log(`⏳ Running unified auto-sync (Plaid + Stripe) for day ${dayOfMonth}...`);
        // const baseUrl = process.env.FUNCTION_BASE_URL || "https://<your-function-name>.azurewebsites.net/api";
        try {
            const plaidRes = await fetchPlaidTransactions(context);
            //const plaidRes = await axios.get("http://localhost:7071/api/plaid/transactions?userId=1");//change url
            context.log("✅ Plaid sync completed:", plaidRes);
        } catch (err) {
            context.log("❌ Plaid sync failed:", getError(err));
        }

        try {
            const stripeRes = await fetchStripeTransactions(context);
            //const stripeRes = await axios.get("http://localhost:7071/api/stripe/transactions");//change url
            context.log("✅ Stripe sync completed:", stripeRes);
        } catch (err) {
            context.log("❌ Stripe sync failed:", getError(err));
        }

    },
});

const sqlInputStripeInvoices = input.sql({
    commandText: 'SELECT [InvoiceID], [Date], [Description], [Amount], [Platform], [Category], [CreatedAt] FROM dbo.StripeInvoices',
    commandType: 'Text',
    connectionStringSetting: "SqlConnectionString"
});//`Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,

app.http('invoices', {
    route: "invoices",
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputStripeInvoices],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const invoices = context.extraInputs.get(sqlInputStripeInvoices);
        return {
            jsonBody: { invoices },
        };
    },
});
