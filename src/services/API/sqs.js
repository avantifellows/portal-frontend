import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const REGION = "ap-south-1";
const queueURL = "https://sqs.ap-south-1.amazonaws.com/111766607077/EventQueue";
const sqsClient = new SQSClient({
  region: REGION,
  credentials: {
    accessKeyId: 'AKIARUBOPCTSSU3W7SML',
    secretAccessKey: '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',
  },
});

async function sendSQSMessage(purpose, purposeParams, redirectTo, redirectID, userID, doesUserExist) {
    const messageBody = [
      {
        DateTime: Date.now().toString(),
        Purpose: {
          type: purpose,
          subtype: purposeParams,
          params: {
            platform: redirectTo,
            id: redirectID,
          },
        },
        auth_type: "SRN", //for now, this is hardcoded
        User: {
          values: userID,
          userdata_validated: doesUserExist,
        },
      },
    ];
    const params = {
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: queueURL,
    };

    try {
      const data = await sqsClient.send(new SendMessageCommand(params));
      console.log("Success, message sent. MessageID:", data.MessageId);
    } catch (err) {
      console.log("Error", err);
    }
  }


export { sendSQSMessage};




