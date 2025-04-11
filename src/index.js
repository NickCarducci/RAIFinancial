const { app, input } = require('@azure/functions');

const sqlInputGeneralLedger = input.sql({
    commandText: 'select [Date], [Description], [Amount], [Category], [Platform], [LinkedAccount], [CreatedAt] from dbo.GeneralLedger',
    commandType: 'Text',
    connectionStringSetting: `Driver={ODBC Driver 18 for SQL Server};Server=tcp:raiautomay.database.windows.net,1433;Database=RAIFinance;Uid=dumbcult;Pwd=${process.env.PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,
});

app.http('generalledger', {
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInputGeneralLedger],
    handler: (request, context) => {
        context.log('HTTP trigger and SQL input binding function processed a request.');
        const generalLedger = context.extraInputs.get(sqlInputGeneralLedger);
        return {
            generalLedger,
        };
    },
});