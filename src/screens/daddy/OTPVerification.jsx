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
  ScrollView,
  Platform,
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
  const [focusedBox, setFocusedBox] = useState(0);

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
    const digits = value.replace(/\D/g, '');
    if (index === 0 && digits.length > 1) {
      newOtp = digits.slice(0, otp.length).split('');
      while (newOtp.length < otp.length) newOtp.push('');
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length, otp.length) - 1]?.focus();
      setError('');
      return;
    }
  
    // Normal single character entry
    newOtp[index] = digits.slice(-1);
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
        <StatusBar backgroundColor="#F4F7F4" barStyle="dark-content" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.brandHeader}>
              <View style={styles.logoBadge}>
                <Image
                  source={require('./tabassets/singlevendorlogo.png')}
                  resizeMode="contain"
                  style={styles.logoImage}
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>Single Vendor</Text>
                <Text style={styles.headerCaption}>FRESHNESS AT YOUR DOORSTEP</Text>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.stepBadge}>
                <Icon name="shield-check-outline" size={14} color="#147A43" />
                <Text style={styles.stepText}>SECURE SIGN-IN</Text>
              </View>
              <Text style={styles.title}>Check your messages</Text>
              <Text style={styles.subtitle}>
                Enter the 4-digit code we sent to
              </Text>
              <View style={styles.phoneRow}>
                <Text style={styles.phoneNumber}>
                  +91 {maskPhoneNumber(route.params?.phoneNumber)}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  accessibilityRole="button"
                  accessibilityLabel="Change phone number">
                  <Text style={styles.changePhone}>Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={el => (inputRefs.current[index] = el)}
                    style={[
                      styles.otpBox,
                      error && styles.otpBoxError,
                      focusedBox === index && !error && styles.otpBoxFocused,
                    ]}
                    keyboardType="number-pad"
                    maxLength={index === 0 ? otp.length : 1}
                    placeholderTextColor="#D1D5DB"
                    textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                    autoComplete={index === 0 ? 'sms-otp' : 'off'}
                    value={digit}
                    onFocus={() => setFocusedBox(index)}
                    onBlur={() => setFocusedBox(-1)}
                    onChangeText={value => handleOTPChange(value, index)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                        setFocusedBox(index - 1);
                        inputRefs.current[index - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Icon name="alert-circle" size={15} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.resendRow}>
                {timer !== 0 ? (
                  <Text style={styles.resendTimer}>
                    Resend code in{' '}
                    <Text style={styles.resendTimerValue}>{timer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={resendOtpHandler}
                    style={styles.resendButton}
                    activeOpacity={0.7}>
                    <Icon name="refresh" size={15} color="#117943" />
                    <Text style={styles.resendButtonText}>Resend code</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={handleVerifyOtp}
                style={[styles.primaryButton, loader && { opacity: 0.7 }]}
                disabled={loader}
                activeOpacity={0.85}>
                {loader ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      {showNewUserModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(6, 94, 44, 0.92)",
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
    backgroundColor: '#F4F7F4',
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
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(1),
    paddingBottom: responsiveHeight(1.2),
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7EEE8',
    marginRight: 12,
  },
  logoImage: {
    width: 44,
    height: 38,
  },
  headerTitle: {
    color: '#14241A',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  headerCaption: {
    marginTop: 3,
    color: '#718176',
    fontSize: 9,
    letterSpacing: 1.05,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(1.5),
    paddingBottom: responsiveHeight(2),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8EEE9',
    paddingHorizontal: responsiveWidth(6),
    paddingTop: responsiveHeight(3.2),
    paddingBottom: responsiveHeight(3),
    shadowColor: '#183B25',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF6F0',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 16,
  },
  stepText: {
    color: '#287149',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  title: {
    color: '#17251B',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 31,
  },
  subtitle: {
    color: '#738076',
    fontSize: 14,
    textAlign: 'left',
    marginTop: 8,
    lineHeight: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  phoneNumber: {
    color: '#34473A',
    fontSize: 14,
    fontWeight: '600',
  },
  changePhone: {
    color: '#147A43',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 18,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendTimer: {
    color: '#718176',
    fontSize: 14,
  },
  resendTimerValue: {
    color: '#26382B',
    fontWeight: '700',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#147A43',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  primaryButton: {
    backgroundColor: '#147A43',
    height: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  otpContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveHeight(3.6),
    gap: responsiveWidth(2.5),
  },
  otpBox: {
    width: responsiveWidth(17),
    height: responsiveWidth(17),
    borderWidth: 1.5,
    borderColor: '#DDE6DE',
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '700',
    color: '#17251B',
    backgroundColor: '#FBFCFB',
  },
  otpBoxFocused: {
    borderColor: '#147A43',
    backgroundColor: '#F4FAF5',
  },
  otpBoxError: {
    borderColor: '#D94638',
    backgroundColor: '#FFF8F7',
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
