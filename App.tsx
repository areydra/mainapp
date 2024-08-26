/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import type {PropsWithChildren} from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import {PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import installations from '@react-native-firebase/installations';
import analytics from '@react-native-firebase/analytics';

// async function bootstrap() {
//   await inAppMessaging().setMessagesDisplaySuppressed(true);
// }

async function onSetup() {
  console.log('isMessagesDisplaySuppressed',inAppMessaging().isMessagesDisplaySuppressed)
  await inAppMessaging().setMessagesDisplaySuppressed(false)
  .then(val => {
    console.log('isMessagesDisplaySuppressed',inAppMessaging().isMessagesDisplaySuppressed)
  })
  .catch(err => {
    console.log('error here', err);
  });
}

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', remoteMessage);
      const customData = remoteMessage.data; // Custom data from the message
      console.log('Custom Data 1:', customData);
    });
  
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Handle background messages
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background:', remoteMessage.notification);
      const customData = remoteMessage.data; // Custom data from the message
      console.log('Custom Data: 2', customData);
    });
  
    // Check if the app was opened from a killed state
    const checkInitialNotification = async () => {
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('Notification caused app to open from a quit state:', initialNotification.notification);
        const customData = initialNotification.data; // Custom data from the message
        console.log('Custom Data: 3', customData);
      }
    };
  
    checkInitialNotification();
  
    // Cleanup
    return () => {
      unsubscribeOnNotificationOpened();
    };
  }, []);

  useEffect(() => {
    Linking.addEventListener('url', ({ url }) => {
      console.log('URL Deeplink: ', url);
    });

    const initializeMessaging = async () => {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      await messaging().registerDeviceForRemoteMessages();

      // Get FCM token and Installation ID
      const token = await messaging().getToken();
      const installationId = await installations().getId();

      console.log('FCM Token:', token);
      console.log('Installation ID:', installationId);
      // Bootstrap and setup In-App Messaging
      // await bootstrap();
      analytics().logAppOpen().then((val) => {
        console.log('Log APP: ', val);
      });

      setTimeout(() => {
        onSetup();
      }, 1000);
    };

    messaging().app.analytics().setUserId('239110').then(() => {
      initializeMessaging();
    });
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <TouchableOpacity
          onPress={() => {
            analytics().logEvent('should_trigger_in_app').then((val) => {
              console.log('success send event');
            });
          }}
          style={{
            backgroundColor: '#9dd1ab',
            padding: 12,
          }}
        >
          <Text>Send APP_OPEN</Text>
        </TouchableOpacity>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
