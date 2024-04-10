import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const REGION = import.meta.env.VITE_APP_AWS_REGION;
const QUEUEURL = import.meta.env.VITE_APP_AWS_SQS_URL;
const sqsClient = new SQSClient({
  region: REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_APP_AWS_SECRET_KEY,
  },
});

/** This function is used to send an SQS message to the queue on AWS.
 * @param {String} purpose
 * @param {String} purposeParams
 * @param {String} redirectTo
 * @param {String} redirectId
 * @param {Array} userIDList - list of users wanting to go through the layer
 * @param {String} authType
 * @param {String} groupName
 * @param {String} userType
 * @param {String} sessionId
 * @param {String} userIpAddress
 * @param {String} phoneNumber
 * @param {String} batch
 * Everything, except the userIDList, is extracted from the auth layer URL
 */

export async function sendSQSMessage(
  type,
  sub_type,
  platform,
  platformId,
  userId,
  authType,
  authGroup,
  userType,
  sessionId,
  userIpAddress,
  phoneNumber,
  batch,
  dateOfBirth
) {
  const messageBody = [
    {
      type: type,
      sub_type: sub_type,
      platform: platform,
      platform_id: platformId,
      auth_type: authType,
      user_id: userId,
      user_validated: true,
      auth_group: authGroup,
      user_type: userType,
      session_id: sessionId,
      user_ip_address: userIpAddress,
      phone_number: phoneNumber,
      batch: batch,
      date_of_birth: dateOfBirth,
    },
  ];
  const params = {
    MessageBody: JSON.stringify(messageBody),
    QueueUrl: QUEUEURL,
  };
  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log("Success, message sent. MessageID:", data.MessageId);
    return true;
  } catch (err) {
    console.log("Error", err);
  }
}
