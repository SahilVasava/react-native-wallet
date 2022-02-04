/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import type {Node} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import WalletConnect from '@walletconnect/client';
// import {WalletConnector} from 'walletconnect';
import Camera, {RNCamera} from 'react-native-camera';
const Section = ({children, title}): Node => {
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
};

const App: () => Node = () => {
  const [opened, setOpened] = useState(false);
  const [qrFound, setQrFound] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const scan = () => {
    setOpened(true);
    console.log('scanning', opened);
  };
  let connector = null;
  const onBarCodeRead = async e => {
    console.log('onBarCodeRead', e);
    setOpened(false);
    setQrFound(true);

    // set session
    // const data = JSON.parse(e.data);
    // const {sessionId, sharedKey} = data;

    try {
      connector = new WalletConnect({
        // Required
        uri: e.data,
        // Required
        clientMeta: {
          description: 'WalletConnect Developer App',
          url: 'https://walletconnect.org',
          icons: ['https://walletconnect.org/walletconnect-logo.png'],
          name: 'WalletConnect',
        },
      });
      console.log('connector', connector);
      // const walletConnector = new WalletConnector(
      //   'https://walletconnect.matic.network',
      //   {
      //     sessionId,
      //     sharedKey,
      //     dappName: 'Walletconnect test',
      //   },
      // );

      // sending session data
      await connector.sendSessionStatus({
        fcmToken: '1234', // TODO use real fcm token
        walletWebhook: 'https://walletconnect.matic.network/notification/new',
        data: {
          address: '0x123', // TODO use real address :)
        },
      });

      // success alert
      Alert.alert('Connected', 'Successfully connected with app');
    } catch (e) {
      console.log(e);

      // success alert
      Alert.alert('Failed', 'Connection with app failed. Please try again.');
    }
  };
  useEffect(() => {
    if (!connector) return;
    connector.on('session_request', (error, payload) => {
      if (error) {
        throw error;
      }
      console.log('session_request', payload);

      // Handle Session Request

      /* payload:
        {
          id: 1,
          jsonrpc: '2.0'.
          method: 'session_request',
          params: [{
            peerId: '15d8b6a3-15bd-493e-9358-111e3a4e6ee4',
            peerMeta: {
              name: "WalletConnect Example",
              description: "Try out WalletConnect v1.0",
              icons: ["https://example.walletconnect.org/favicon.ico"],
              url: "https://example.walletconnect.org"
            }
          }]
        }
        */
    });
  }, [connector]);
  console.log('hahahah', opened);
  let mainView = null;
  if (opened && !qrFound) {
    mainView = (
      // <Camera
      //   style={styles.preview}
      //   onBarCodeRead={onBarCodeRead}
      //   // aspect={Camera.constants.Aspect.fill}
      // />
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        defaultTouchToFocus
        flashMode={RNCamera.Constants.FlashMode.auto}
        mirrorImage={false}
        onBarCodeRead={onBarCodeRead}
        onFocusChanged={() => {}}
        onZoomChanged={() => {}}
        // permissionDialogTitle={'Permission to use camera'}
        // permissionDialogMessage={
        // }
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera phone',
        }}
        style={styles.preview}
        captureAudio={false}
        type={RNCamera.Constants.Type.back}
        // onGoogleVisionBarcodesDetected={({barcodes}) => {
        //   console.log(barcodes);
        // }}
      />
    );
  } else {
    mainView = (
      <View style={styles.buttonContainer}>
        <Button
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
          title="Scan DApp QR"
          onPress={scan}
        />
      </View>
    );
  }
  return <View style={styles.container}>{mainView}</View>;
  // return (
  //   <SafeAreaView style={backgroundStyle}>
  //     <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
  //     <ScrollView
  //       contentInsetAdjustmentBehavior="automatic"
  //       style={backgroundStyle}>
  //       <Header />
  //       <View
  //         style={{
  //           backgroundColor: isDarkMode ? Colors.black : Colors.white,
  //         }}>
  //         <Section title="Step One">
  //           Edit <Text style={styles.highlight}>App.js</Text> to change this
  //           screen and then come back to see your edits.
  //         </Section>
  //         <Section title="See Your Changes">
  //           <ReloadInstructions />
  //         </Section>
  //         <Section title="Debug">
  //           <DebugInstructions />
  //         </Section>
  //         <Section title="Learn More">
  //           Read the docs to discover what to do next:
  //         </Section>
  //         <LearnMoreLinks />
  //       </View>
  //     </ScrollView>
  //   </SafeAreaView>
  // );
};

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
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default App;
