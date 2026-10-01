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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
              <Text style={styles.eyebrow}>WELCOME</Text>
              <Text style={styles.title}>Your everyday shop, delivered.</Text>
              <Text style={styles.subtitle}>
                Sign in or create an account with your mobile number.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.countryCode}>+91</Text>
                  <View style={styles.countryDivider} />
                  <TextInput
                    style={styles.input}
                    placeholder="10 digit mobile number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    autoComplete="tel"
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
                </View>

                {filteredSuggestions.length > 0 && (
                  <View style={styles.suggestions}>
                    {filteredSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setPhoneNumber(suggestion);
                          setFilteredSuggestions([]);
                        }}
                        style={[
                          styles.suggestionRow,
                          index !== filteredSuggestions.length - 1 &&
                            styles.suggestionBorder,
                        ]}>
                        <Icon name="phone-outline" size={16} color="#9CA3AF" />
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handleGetOTP}
                style={[styles.primaryButton, sendingOTP && { opacity: 0.7 }]}
                disabled={sendingOTP}
                activeOpacity={0.85}>
                {sendingOTP ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Get OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.securityNote}>
                <Icon name="shield-check-outline" size={17} color="#66816F" />
                <Text style={styles.securityText}>A quick, secure sign-in with OTP</Text>
              </View>

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
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F7F4',
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
    paddingTop: responsiveHeight(3.5),
    paddingBottom: responsiveHeight(3),
    shadowColor: '#183B25',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  eyebrow: {
    color: '#17804A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 8,
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
    lineHeight: 21,
  },
  fieldGroup: {
    marginTop: responsiveHeight(3.5),
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34473A',
    letterSpacing: 0.2,
    marginBottom: 9,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE6DE',
    borderRadius: 14,
    backgroundColor: '#FBFCFB',
    height: 58,
    paddingHorizontal: responsiveWidth(4),
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18291D',
  },
  countryDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E5E7EB',
    marginHorizontal: responsiveWidth(3),
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#18291D',
    paddingVertical: 0,
  },
  suggestions: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: responsiveHeight(1),
    overflow: 'hidden',
    maxHeight: 150,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: responsiveWidth(4),
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    color: '#111827',
    fontSize: 15,
    marginLeft: 10,
  },
  primaryButton: {
    backgroundColor: '#147A43',
    height: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveHeight(3),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  securityText: {
    color: '#718176',
    fontSize: 12,
    marginLeft: 7,
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
