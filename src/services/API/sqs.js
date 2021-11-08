import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const REGION = "ap-south-1";
const QUEUEURL = "https://sqs.ap-south-1.amazonaws.com/111766607077/EventQueue";
const sqsClient = new SQSClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VUE_APP_AWS_SECRET_KEY,
  },
});

/* This function is used to send an SQS message to the queue on AWS. Makes use of the AWS SDK. (SendMessageCommand)
@params {String} - purpose
@params {String} - purposeParams
@params {String} - redirectTo
@params {String} - redirectID
@params {Array} - userIDList - list of users wanting to go through the layer
@params {String} - authType
Everything, except the userIDList, is extracted from the auth layer URL
*/
export async function sendSQSMessage(purpose, purposeParams, redirectTo, redirectID, userIDList, authType) {

    const messageBody = [
      {
        dateTime: new Date(),
        purpose: {
          type: purpose,
          subType: purposeParams,
          params: {
            platform: redirectTo,
            id: redirectID,
          },
        },
        authType: authType,
        user: {
          values: userIDList,
        },
      },
    ];
    const params = {
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: QUEUEURL,
    };

    try {
      const data = await sqsClient.send(new SendMessageCommand(params));
      console.log("Success, message sent. MessageID:", data.MessageId);
    } catch (err) {
      console.log("Error", err);
    }
  }




