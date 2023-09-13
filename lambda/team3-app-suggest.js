const { DynamoDBClient, ScanCommand, GetItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const Log_TableName = "Team3-app-post";
const Foods_TableName = "Food";
const User_TableName = "Team3-app-user";
var eat_count = 1;

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  const userId = event.queryStringParameters.userId;
  const token = event.queryStringParameters.token;
  
  const param_Log = {
    TableName: Log_TableName,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: {
      ":uid": { S: userId }
    }
  };
  
  const param_User = {
    TableName: User_TableName,
    Key: marshall({
      userId,
    }),
  };
  
  const param_Food = {
    TableName: Foods_TableName,
  };

  const command_Log = new QueryCommand(param_Log);
  const command_User = new GetItemCommand(param_User);
  const command_Food = new ScanCommand(param_Food);

  try {
    const result_Log = await client.send(command_Log);
    const Log = result_Log.Items;
    
    const result_User = await client.send(command_User);
    const User = result_User.Item;
    
    const result_Foods = await client.send(command_Food);
    const Foods = result_Foods.Items;

    const unmarshalledLogItems = Log.map(item => unmarshall(item));
    const unmarshalledUserItem = unmarshall(User);
    const unmarshalledFoodItems = Foods.map((item) => unmarshall(item));
    
    const season = unmarshalledUserItem.season;
    
    if (season == 1) {
      eat_count = 2;
    } else if (season == 2) {
      eat_count = 2;
    } else if (season == 3) {
      eat_count = 3;
    } else if (season == 4) {
      eat_count = 4;
    };

    console.log(eat_count);
    
    
    
    response.body = JSON.stringify({ 
      logs: unmarshalledLogItems,
      user: unmarshalledUserItem,
      foods: unmarshalledFoodItems,
    });

  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }
  

  return response;
};
