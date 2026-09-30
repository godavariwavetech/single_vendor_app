import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AuthBackground from './tabassets/AuthBackground';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import GoogleIcon from '../user/svgs/GoogleIcon';
import { actionLogin, setInitial, verifyCustomerMobile } from '../../redux/reducers/auth';
import { useDispatch, useSelector } from 'react-redux';
import CustomModal from '../../components/CustomModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getUserLoginOTP } from '../../services/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import CustomModal from '../components/CustomModal';
import { useColorScheme } from 'react-native';



export default function Register({ navigation, route }) {
  const { withoutLogin } = route.params || {};   // safe check

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: ''
  });
  const [sendingOTP, setSendingOTP] = useState(false);
  const dispatch = useDispatch();
  const loading = useSelector(state => state.Auth.loading);
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';


  useEffect(() => {
    const loadPhoneHistory = async () => {
      try {
        const history = JSON.parse(await AsyncStorage.getItem('phoneHistory')) || [];
        setPhoneSuggestions(history);
      } catch (e) {
        console.error('Failed to load phone history', e);
      }
    };
    loadPhoneHistory();
    dispatch(setInitial());
  }, []);


  const showErrorModal = (title, message) => {
    setModalContent({ title, message });
    setModalVisible(true);
  };

  const validateForm = () => {
    if (!phoneNumber) {
      showErrorModal('Validation Error', 'Phone number is required');
      return false;
    } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
      showErrorModal('Validation Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const savePhoneNumber = async (number) => {
    try {
      let history = JSON.parse(await AsyncStorage.getItem('phoneHistory')) || [];
      history = history.filter(n => n !== number); // remove duplicates
      history.unshift(number); // add to front
      if (history.length > 5) history.pop(); // keep only latest 5
      await AsyncStorage.setItem('phoneHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save number', e);
    }
  };

  const handleGetOTP = async () => {
    if (validateForm()) {
      setSendingOTP(true);
      await savePhoneNumber(phoneNumber);
      try {
        const response = await getUserLoginOTP(parseInt(phoneNumber, 10));
    
        if (response.status === 200) {
          navigation.navigate(  withoutLogin ? "OTPVerification1" : "OTPVerification", {
            phoneNumber: phoneNumber,
            otp: response.loginotp,
            isFromCart: route.params?.isFromCart || null,
            user_ind: response.user_ind,
            message: response.message,
            withoutLogin: withoutLogin
            // username: username.trim()
          });
        } else {
          Alert.alert('Error', 'Failed to generate OTP');
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to get OTP. Please try again.');
        console.error(error);
      } finally {
        setSendingOTP(false);
      }
    }
  };


  return (
    <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()} >
      <View style={styles.main}>
        <CustomModal
          visible={modalVisible}
          title={modalContent.title}
          message={modalContent.message}
          onConfirm={() => setModalVisible(false)}
          confirmText="OK"
          cancelText={null}
        />
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#065E2C" />
          </View>
        )}
        <StatusBar translucent hidden />
        <View
          style={{
            width: responsiveWidth(100),
            height: responsiveHeight(30),
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={require('./tabassets/singlevendorlogo.png')}
            resizeMode="contain"
            style={{
              width: responsiveWidth(52),
              height: responsiveWidth(52) * 0.675,
            }}
          />
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            transform: [{ translateY: -responsiveHeight(4.5) }],
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderColor: '#E5E5E5',
            paddingHorizontal: responsiveWidth(5),
            paddingVertical: responsiveHeight(3),
          }}>
          <Text
            style={{
              color: '#3D3D3D',
              textAlign: 'center',
              fontSize: 20,
              fontWeight: '500',
            }}>
            Please enter your phone number to continue
          </Text>
          <View style={{ marginTop: responsiveHeight(5) }}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              placeholderTextColor={isDarkMode ? '#CCCCCC' : '#3D3D3D'}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, '');
                setPhoneNumber(numericText);

                const filtered = phoneSuggestions.filter(item =>
                  item.startsWith(numericText)
                );
                setFilteredSuggestions(filtered);
              }}
              maxLength={10}
            />

            {filteredSuggestions.length > 0 && (
              <View style={{
                backgroundColor: '#fff',
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 8,
                marginTop: 5,
                maxHeight: 150,
              }}>
                {filteredSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setPhoneNumber(suggestion);
                      setFilteredSuggestions([]); // hide dropdown
                    }}
                    style={{
                      padding: 10,
                      borderBottomColor: '#eee',
                      borderBottomWidth: index !== filteredSuggestions.length - 1 ? 1 : 0,
                    }}>
                    <Text style={{ color: '#000' }}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          </View>
          <TouchableOpacity
            onPress={handleGetOTP}
            style={[
              styles.loginButton,
              sendingOTP && { opacity: 0.6 } // Visual feedback when disabled
            ]}
            disabled={sendingOTP}
          >
            <Text style={styles.loginText}>
              {sendingOTP ? <ActivityIndicator size="small" color="#fff" /> : 'Get OTP'}
            </Text>
          </TouchableOpacity>

          {/* {!withoutLogin && <>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => dispatch(actionLogin())}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip Login</Text>
              <Icon name="arrow-right" size={20} color="#117943" />
            </TouchableOpacity>
          </>} */}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    color: '#000',
    fontWeight: 'condensed',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  passwordInput: {
    flex: 1,
    color: '#000',
  },
  icon: {
    paddingHorizontal: 10,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    marginRight: 5,
  },
  rememberText: {
    fontSize: 13,
    color: '#7E8A97',
    fontWeight: '400',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#065E2C',
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: "#117943", // updated
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: responsiveHeight(5),
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  signupText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#646982',
    fontWeight: '400',
  },
  signupLink: {
    color: '#065E2C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#646982',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialButton: {
    backgroundColor: '#395998',
    width: 62,
    height: 62,
    borderRadius: 50,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#117943',
    backgroundColor: 'transparent',
    marginTop: responsiveHeight(2),
    marginHorizontal: responsiveWidth(1),
  },
  skipText: {
    color: '#117943',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: responsiveHeight(3),
    marginHorizontal: responsiveWidth(5),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: responsiveWidth(3),
    fontSize: 14,
    color: '#646982',
    fontWeight: '500',
  },
});
