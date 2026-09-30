import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import SplashScreen from 'react-native-splash-screen'
import { Alert, Linking, BackHandler, PermissionsAndroid, Platform, View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { checkNotifications, requestNotifications } from 'react-native-permissions';
import VersionCheck from 'react-native-version-check';
import CustomAlert from './src/components/CustomAlert';
import CustomModal from './src/components/CustomModal';
import NetInfo from '@react-native-community/netinfo';
import { setIsNetworkConnected } from './src/redux/reducers/addressSlice';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import RootNavigation from './src/navigation/AppNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // 👈 add this
import { getFCMToken } from './src/services/NotificationsService';

const NetworkStatusBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [slideAnim] = useState(new Animated.Value(-50));
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      dispatch(setIsNetworkConnected(state.isConnected));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isConnected ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, slideAnim]);

  if (isConnected) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'red',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10
  },
});

const App = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      const token = await getFCMToken();
      console.log('FCM Token:', token);
    }
    getToken();
  }, [showUpdateModal]);

  useEffect(() => {
    SplashScreen.hide();
    checkForUpdate();
    checkAndRequestPermissions();
  }, []);


  useEffect(() => {
    if (showUpdateModal) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [showUpdateModal]);

  const checkAndRequestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {

        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      const { status } = await checkNotifications();
      if (status !== 'granted') {
        const { status: newStatus } = await requestNotifications(['alert', 'sound']);

      }
    }
  };

  const checkForUpdate = async () => {
    try {
      const res = await VersionCheck.needUpdate();
      if (res?.isNeeded) {
        setShowUpdateModal(true);
      } else {
        setShowUpdateModal(false);
      }
    } catch (error) {

    }
  };

  const handleUpdate = async () => {
    try {
      await Linking.openURL("https://play.google.com/store/apps/details?id=com.singlevendor&pcampaignid=web_share");

    } catch (error) {
      console.error('Failed to open Play Store:', error);
    } finally {
      // Force close app after redirecting
      BackHandler.exitApp();
    }
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={{ flex: 1 }}>
            <NetworkStatusBanner />
            <RootNavigation />
            <CustomModal
              visible={showUpdateModal}
              title="Update Available"
              message="A new version of the app is available. Please update to continue using all features."
              confirmText="Update Now"
              onConfirm={handleUpdate}
              cancelText=""
            />
            <Toast
              config={{
                success: (props) => (
                  <View style={{
                    backgroundColor: '#4CAF50',
                    padding: 16,
                    borderRadius: 8,
                    marginHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                    <Icon name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                        {props.text1}
                      </Text>
                      {props.text2 && (
                        <Text style={{ color: '#fff', fontSize: 14, marginTop: 2 }}>
                          {props.text2}
                        </Text>
                      )}
                    </View>
                  </View>
                ),
                error: (props) => (
                  <View style={{
                    backgroundColor: '#f44336',
                    padding: 16,
                    borderRadius: 8,
                    marginHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                    <Icon name="error" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                        {props.text1}
                      </Text>
                      {props.text2 && (
                        <Text style={{ color: '#fff', fontSize: 14, marginTop: 2 }}>
                          {props.text2}
                        </Text>
                      )}
                    </View>
                  </View>
                ),
                info: (props) => (
                  <View style={{
                    backgroundColor: '#2196F3',
                    padding: 16,
                    borderRadius: 8,
                    marginHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                    <Icon name="info" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                        {props.text1}
                      </Text>
                      {props.text2 && (
                        <Text style={{ color: '#fff', fontSize: 14, marginTop: 2 }}>
                          {props.text2}
                        </Text>
                      )}
                    </View>
                  </View>
                ),
              }}
              topOffset={Platform.OS === 'ios' ? 60 : 40}
              visibilityTime={4000}
              autoHide={true}
            />
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
