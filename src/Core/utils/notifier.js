import dotenv from "dotenv";
dotenv.config();
import admin from "firebase-admin";
console.log()
let firebaseadmin = null;
let defaultAuth = null;

const getFirebaseAdmin = () => {
  if (!firebaseadmin) {
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn("Firebase config missing! Please check .env");
    }
    firebaseadmin = admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
      }),
    });
    defaultAuth = firebaseadmin.auth();
  }
  return firebaseadmin;
};
export const FirebaseService = {
    notify: async (tokens, notification, fcmoptions) => {
    try {
          console.log("tokens ",tokens)
          console.log("notification ",notification)
          console.log("fcmoptions ",fcmoptions)
            const fbadmin = getFirebaseAdmin();
            
            const notificationPayload = { 
              title: notification.title, 
              body: notification.body 
            };
            
            const imgUrl = notification.image || notification.imageUrl;
            if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim() !== '') {
              // S3/FCM only accepts fully qualified HTTP/HTTPS URLs for imageUrl
              if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
                notificationPayload.imageUrl = imgUrl;
              }
            }

            const message = {
                tokens: tokens,
                notification: notificationPayload,
            };

            if (notification.data) message.data = notification.data;
            if (notification.android) message.android = notification.android;
            if (notification.apns) message.apns = notification.apns;
            if (fcmoptions) message.fcmOptions = fcmoptions;

            const response = await fbadmin.messaging().sendEachForMulticast(message);
            console.log("response ",response.error)
            return response;

        } catch (error) {
          console.log(error)
             return null;
        }
    },

    notifyUsers: async (body) => {
        let data = {
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
            "sound": "default",
            "status": "done",
            "screen": ""
        }
        let apns = { "payload": { "aps": { "sound": "default" } } }
        let android = { priority: 'high', notification: { sound: 'default', } }
        let priority = { "priority": "high" }
        body = { ...body, data: data, apns: apns, android: android, priority: priority }
        try {
            await FirebaseService.notify(body.token, {
                title: body.title,
                image: body.image,
                body: body.description,
                data: body.data,
                apns: body.apns,
                android: body.android,
                priority: body.priority
            }, {
                fcmOptions: {
                    link: body.link,
                },
            }).then((response) => {
                console.log(response)
            }).catch((err) => {
                console.log("err", err)
            });
        } catch (error) {
          console.log(error)
            return null;
        }
    },

    notifyOrderStatus: async (body, value) => {
        let data = {
          "click_action": "FLUTTER_NOTIFICATION_CLICK",
          "sound": "default",
          "status": "done",
          "screen": `${body.path}`
        }
        // console.log("data", data)
        let apns = {
          "payload": { "aps": { "sound": "default" } }
        }
        let android = {
          priority: 'high',
          notification: {
            sound: 'default',
          }
        }
        let priority = { "priority": "high" }
        body = {
          ...body, data: data, apns: apns, android: android, priority: priority
        }
        try {
          await FirebaseService.notify(body.token, {
            title: body.eventTitle,
            path: body.path,
            body: body.eventDescription,
            data: body.data,
            apns: body.apns,
            android: body.android,
            priority: body.priority
          },).then((response) => {
            console.log(response)
          }).catch((err) => {
            console.log("err", err)
          });;
        } catch (error) {
          return null;
        }
    },
    
    getAuth: async (data) => {
        try {
            getFirebaseAdmin();
            return await defaultAuth.verifyIdToken(data.id_token)
        }
        catch (error) {
            return "Invalid Token";
        }
    },
    
    sendNotifications: async (data) => {
      try {
        console.log("datta ", data);
        if (!data || !data.token) {
          console.log("No notification tokens provided.");
          return null;
        }
        
        // Filter out any non-string, empty, or whitespace-only tokens
        const rawTokens = Array.isArray(data.token) ? data.token : [data.token];
        const tokens = [...new Set(rawTokens)].filter(t => typeof t === 'string' && t.trim() !== '');
        
        if (tokens.length === 0) {
          console.log("No valid S3/FCM registration tokens provided after filtering.");
          return null;
        }
        
        const title = data.title || data.msgTitle || "Notification";
        const body = data.description || data.msgDesc || "";
        const image = data.image || data.msgImage || "";
        const link = data.link || data.msgLink || "";
        const type = data.msgType || "";

        const payloadData = {
          "click_action": "FLUTTER_NOTIFICATION_CLICK",
          "sound": "default",
          "status": "done",
          "screen": type,
          "link": link ? String(link) : ""
        };

        const apns = { "payload": { "aps": { "sound": "default" } } };
        const android = { priority: 'high', notification: { sound: 'default' } };

        await FirebaseService.notify(tokens, {
          title: title,
          body: body,
          image: image,
          data: payloadData,
          apns: apns,
          android: android
        }, {
          fcmOptions: {
            link: link ? String(link) : "",
          }
        });
      } catch (error) {
        console.log("Error in sendNotifications:", error);
        return null;
      }
    },
}
