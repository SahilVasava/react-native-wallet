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
import * as ethers from 'ethers';

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
  const [connector, setConnector] = useState(null);
  const [wallet, setWallet] = useState(null);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  useEffect(() => {
    const wallet = new ethers.Wallet.createRandom();
    console.log('wallet', wallet);
    setWallet(wallet);
  }, []);
  const scan = () => {
    setOpened(true);
    console.log('scanning', opened);
  };
  const onBarCodeRead = async e => {
    console.log('onBarCodeRead', e);
    setOpened(false);
    setQrFound(true);

    // set session
    // const data = JSON.parse(e.data);
    // const {sessionId, sharedKey} = data;

    try {
      let connectorInst = new WalletConnect({
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
      setConnector(connectorInst);
      console.log('connectorInst', connectorInst);
      if (!connectorInst.connected) {
        console.log('connectorInst.connected', connectorInst.connected);
        await connectorInst.createSession();
        console.log('sess');
      }
      console.log('connector', connectorInst);
      // subToEvents();
      // const walletConnector = new WalletConnector(
      //   'https://walletconnect.matic.network',
      //   {
      //     sessionId,
      //     sharedKey,
      //     dappName: 'Walletconnect test',
      //   },
      // );

      // sending session data
      // await connector.sendSessionStatus({
      //   fcmToken: '1234', // TODO use real fcm token
      //   walletWebhook: 'https://walletconnect.matic.network/notification/new',
      //   data: {
      //     address: '0x123', // TODO use real address :)
      //   },
      // });

      // success alert
      Alert.alert('Connected', 'Successfully connected with app');
    } catch (e) {
      console.log(e);

      // success alert
      Alert.alert('Failed', 'Connection with app failed. Please try again.');
    }
  };
  // const subToEvents = () => {
  useEffect(() => {
    if (!connector || !wallet) return;
    console.log('subToEvents');
    connector.on('session_request', (error, payload) => {
      console.log('EVENT', 'session_request');

      if (error) {
        throw error;
      }
      console.log('SESSION_REQUEST', payload.params);
      const {peerMeta} = payload.params[0];
      console.log('PEER_META', peerMeta);
      connector.approveSession({chainId: 3, accounts: [wallet.address]});
    });
    connector.on('session_update', error => {
      console.log('EVENT', 'session_update');

      if (error) {
        throw error;
      }
    });

    connector.on('call_request', async (error, payload) => {
      // tslint:disable-next-line
      console.log('EVENT', 'call_request', 'method', payload.method);
      console.log('EVENT', 'call_request', 'params', payload.params);

      if (error) {
        throw error;
      }

      // await getAppConfig().rpcEngine.router(payload, this.state, this.bindedSetState);
      let data = payload.params[0];
      if (data && data.from) {
        delete data.from;
      }
      data.gasLimit = data.gas;
      delete data.gas;
      const result = await wallet.signTransaction(data);
      connector.approveRequest({
        id: payload.id,
        result,
      });
    });

    connector.on('connect', (error, payload) => {
      console.log('EVENT', 'connect');

      if (error) {
        throw error;
      }

      // this.setState({ connected: true });
    });

    connector.on('disconnect', (error, payload) => {
      console.log('EVENT', 'disconnect');

      if (error) {
        throw error;
      }

      // this.resetApp();
    });
  }, [connector, wallet]);
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
