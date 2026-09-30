import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Alert,
  Linking,
  Animated, Easing
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import AuthBackground from './tabassets/AuthBackground';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import GoogleIcon from '../user/svgs/GoogleIcon';
import { useDispatch } from 'react-redux';
import { actionLogin, addCustomer, setCustormarId, setMobile, setReferalCode, setUserName, verifyCustomerMobile, verifyCustomerOTP } from '../../redux/reducers/auth';
import Geolocation from '@react-native-community/geolocation';
import { checkAddressExistence } from '../../redux/reducers/daddy';
import { customerLogin } from '../../services/services';
import { useColorScheme } from 'react-native';

import { CommonActions } from '@react-navigation/native';







export default function OTPVerification({ navigation, route }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.95)).current;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const dispatch = useDispatch();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [formError, setFormError] = useState('');
  const [responseOtp, setResponseOtp] = useState(route.params.otp || "")

  useEffect(() => {
    if (showNewUserModal) {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      modalOpacity.setValue(0);
      modalScale.setValue(0.95);
    }
  }, [showNewUserModal]);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        clearInterval(countdown);
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);



  const handleVerifyOtp = async () => {
    if (otp.includes('')) {
      setError('Please enter all 4 digits of the OTP');
      return;
    }
    const enteredOtp = otp.join('');
    setLoader(true);
   
    try {
      if (enteredOtp.trim() === String(responseOtp).trim()) {
        if (route.params?.user_ind === 1) {
          // ✅ Existing user 
          const loginResponse = await customerLogin({
            customer_mobile_number: parseInt(route.params?.phoneNumber, 10),
            customer_user_name: newUsername,
            player_id: route.params?.playerId || '',
            location_id: route.params?.locationId || 1,
            user_ind: 1,
            referral_code: referralCode.trim() || '',
          });

          if (loginResponse?.status === 200) {
            dispatch(setCustormarId(loginResponse?.data?.customer_id))
            dispatch(setUserName(loginResponse?.data?.customer_name));
            dispatch(setMobile(route.params?.phoneNumber));
            dispatch(setReferalCode(loginResponse?.data?.referral_code))
            setShowNewUserModal(false);

            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{ name: 'BottomNavigation' }],
            //   })
            // )
            route.params?.withoutLogin
              ?   navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'BottomNavigation' }],
              })
            )
              : dispatch(actionLogin());
          } else {
            setFormError(loginResponse?.data?.msg || 'Login failed. Please try again.');
          }
          setLoader(false);
        } else {
          // 🆕 New user - show modal
          setShowNewUserModal(true);
          setLoader(false);
        }
      } else {
        setError('Invalid OTP. Please try again.');
        setLoader(false);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoader(false);
      console.error(error);
    }
  };


  const handleOTPChange = (value, index) => {
    let newOtp = [...otp];
  
    // Only allow paste in first box
    if (index === 0 && value.length === otp.length) {
      newOtp = value.split('');
      setOtp(newOtp);
      inputRefs.current[otp.length - 1]?.focus(); // focus last input
      setError('');
      return;
    }
  
    // Normal single character entry
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
  
    // Move forward
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  
    // Move backward if cleared
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  

  const maskPhoneNumber = number => {
    if (!number) return '';
    return number.replace(/(\d{2})\d{5}(\d{3})/, '$1*****$2');
  };

 

  const resendOtpHandler = async () => {
    setError("")
    setTimer(60);
    setOtp(['', '', '', '']);
    const response = await dispatch(verifyCustomerMobile({ customer_mobile_number: route.params?.phoneNumber }));
  
    setResponseOtp(response.payload.loginotp.toString())
  };

  const handleNewUserSubmit = async () => {
    if (!newUsername.trim()) {
      setFormError("Username is required");
      return;
    }
    setFormError('');
    setLoader(true);
    try {
      const loginResponse = await customerLogin({
        customer_mobile_number: parseInt(route.params?.phoneNumber, 10),
        customer_user_name: newUsername,
        player_id: route.params?.playerId || '',
        location_id: route.params?.locationId || 1,
        user_ind: 0,
        referral_code: referralCode.trim() || '',
      });

      if (loginResponse?.status === 200) {
        dispatch(setCustormarId(loginResponse?.data?.customer_id))
        dispatch(setUserName(loginResponse?.data?.customer_name));
        dispatch(setMobile(route.params?.phoneNumber));
        dispatch(setReferalCode(loginResponse?.data?.referral_code))
        setShowNewUserModal(false);
        route.params?.withoutLogin
          ? navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'BottomNavigation' }],
            })
          )
          : dispatch(actionLogin());
      } else if (loginResponse?.status === 202 && loginResponse?.data?.msg === "Invalid referral code") {
        // 🛑 Handle referral code error
        setFormError("Referral code is invalid. Please check and try again.");
      } else {
        setFormError(loginResponse?.data?.msg || 'Login failed. Please try again.');
      }

    } catch (err) {
      setFormError('Something went wrong. Try again later.');
      console.error(err);
    } finally {
      setLoader(false);
    }
  };




  return (
    <Pressable onPress={() => Keyboard.dismiss()} style={{ flex: 1 }}>
      <View style={styles.main}>
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
            Enter the verification code we just sent on the mobile number
            {maskPhoneNumber(` ${route.params?.phoneNumber}`)}
          </Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
              key={index}
              ref={el => (inputRefs.current[index] = el)}
              style={[styles.otpBox, { borderColor: isDarkMode ? '#555' : '#ccc' }]}
              keyboardType="numeric"
              maxLength={index === 0 ? otp.length : 1} // only first input allows full paste
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={digit}
              onChangeText={value => handleOTPChange(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                  inputRefs.current[index - 1]?.focus();
                }
              }}
            />
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={{ marginTop: responsiveHeight(5) }}>
            {timer !== 0 && <Text style={{ color: "#3D3D3D", fontSize: 18, fontWeight: "700", textAlign: "center" }}>Resend OTP in {timer}s </Text>}
            <TouchableOpacity disabled={timer != 0} onPress={resendOtpHandler}>
              <Text style={{ fontSize: 14, color: timer == 0 ? "#117943" : "#8F8F8F", fontWeight: "700", textAlign: "center", marginTop: responsiveHeight(1) }}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleVerifyOtp}
            style={[styles.loginButton, loader && { opacity: 0.6 }]}
            disabled={loader}
          >
            {loader ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginText}>Verify</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
      {showNewUserModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "#117943", // Semi-transparent ABHI24 purple
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          paddingHorizontal: 20,
        }}>
          <Animated.View style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            opacity: modalOpacity,
            transform: [{ scale: modalScale }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 6,
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
              Complete Your Signup
            </Text>

            <Text style={{ fontSize: 14, color: '#555', marginBottom: 20, textAlign: 'center' }}>
              Please provide your username to continue. Referral code is optional.
            </Text>

            <TextInput
              placeholder="Enter Username"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={newUsername}
              onChangeText={setNewUsername}
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: isDarkMode ? '#555' : '#ccc',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                color: isDarkMode ? '#fff' : '#000',
                backgroundColor: isDarkMode ? '#222' : '#fff',
              }}
            />

            <TextInput
              placeholder="Referral Code (Optional)"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={referralCode}
              onChangeText={setReferralCode}
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: formError.includes("Referral") ? 'red' : (isDarkMode ? '#555' : '#ccc'),
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                color: isDarkMode ? '#fff' : '#000',
                backgroundColor: isDarkMode ? '#222' : '#fff',
              }}
            />


            {formError ? (
              <Text style={{ color: 'red', marginBottom: 10 }}>{formError}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleNewUserSubmit}
              style={{
                backgroundColor: "#117943",
                width: '100%',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Submit</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

    </Pressable>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginBottom: 15,
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
    // marginVertical: 10,
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
    // marginLeft: "auto",
    fontSize: 14,
    color: '#117943',
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: "#117943",
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
    // marginTop: 15,
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
    // marginVertical: 10,
    fontSize: 16,
    color: '#646982',
  },

  errorText: {
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginTop: 8,
    textAlign: "center"
  },
  otpContainer: {
    flexDirection: 'row',
    // justifyContent: "space-between",
    // marginHorizontal:20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // alignSelf:"center",
    // marginVertical: 16,
    marginTop: responsiveHeight(5),
    gap: 16,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderRadius: 7,
    textAlign: 'center',
    fontSize: 18,
    // backgroundColor: '#F5F9FF',
    borderColor: '#117943',
  },
  timer: {
    color: 'gray',
    marginBottom: 20,
    alignSelf: 'start',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2264D2',
    textAlign: 'center',
  },
  locationLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#117943',
    fontWeight: '500',
  },
  locationErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  locationErrorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#117943',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
