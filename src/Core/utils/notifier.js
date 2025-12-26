import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const firebaseadmin = admin.initializeApp({
    credential: admin.credential.cert(require("../../../config/mapmanFirebase.json")),
});


let defaultAuth = await firebaseadmin.auth();

export const FirebaseService = {
    notify: async (tokens, notification, fcmoptions) => {
        try {
            const response = await firebaseadmin.messaging().sendEachForMulticast({
                tokens: tokens,
                notification: { title: notification.title, body: notification.body},
                data: notification.data,
                android: notification.android,
                apns: notification.apns,
                fcmOptions: fcmoptions,
            });


        } catch (error) {
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
            return await defaultAuth.verifyIdToken(data.id_token)
        }
        catch (error) {
            return "Invalid Token";
        }
    },
    
    sendNotifications: async (data) => {
    try {
      data.token = [...new Set(data.token)];
      await FirebaseService.notify(data.token, {
        title: data.title,
        body: data.description,
        link: data.msgLink,
        image:data.image
      });
    } catch (error) {
      console.log(error)
      return null;
    }
    },
}
