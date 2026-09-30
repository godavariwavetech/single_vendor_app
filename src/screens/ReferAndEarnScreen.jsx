import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { applicationCharges } from '../services/services';
import { actionLogout } from '../redux/reducers/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const ReferAndEarnScreen = ({ navigation }) => {
  const { referralCode, customerId } = useSelector(state => state.Auth);
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const [refferalData, setRefferalData] = useState()
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadApplicationCharges = async () => {
      try {
        const data = await applicationCharges();
        const parsedData = {
          ...data[0],
          refer_content: JSON.parse(data[0].refer_content),
        };

        setRefferalData(parsedData);
      } catch (error) {
        console.error('Failed to load application charges', error);
      }
    };
    loadApplicationCharges();
  }, []);


  const handleCopy = () => {
    Clipboard.setString(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      const bulletPoints = Array.isArray(refferalData?.refer_content)
        ? refferalData.refer_content.slice(0, 2).map((item) => `• ${item}`).join('\n')
        : '';

      const message = `Hey! Use my referral code *${referralCode}* to sign up on Single Vendor.\n\n📲 Download the app: https://play.google.com/store/apps/details?id=com.singlevendor&hl=en\n\n${bulletPoints}`;

      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing referral:', error);
    }
  };




  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#117943" barStyle="light-content" />
      <LinearGradient colors={['#117943', '#117943']} style={[styles.gradientContainer,{paddingTop: insets.top }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome6 name="arrow-left-long" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
        </View>
      </LinearGradient>

      {/* Login Required Section for Unauthenticated Users */}
      {!customerId && (
        <View style={styles.loginRequiredContainer}>
          <View style={styles.loginRequiredContent}>
            <Ionicons name="person-circle-outline" size={60} color="#117943" />
            <Text style={styles.loginRequiredTitle}>Login Required</Text>
            <Text style={styles.loginRequiredMessage}>
              Please login to access your referral code and start earning rewards.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                // dispatch(actionLogout());
                navigation.navigate('Register1', { withoutLogin: true });
              }}
            >
              <Text style={styles.loginButtonText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content - Only show when authenticated */}
      {customerId && (
        <View style={styles.content}>
          <Text style={styles.title}>Invite your friends & earn rewards!</Text>
          <Text style={styles.description}>
            Share your referral code and both of you earn rewards when your friend places their first order.
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.code}>{referralCode}</Text>
            <TouchableOpacity onPress={handleCopy}>
              <Ionicons name="copy-outline" size={24} color="#117943" />
            </TouchableOpacity>
          </View>
          {copied && <Text style={styles.copiedText}>Code copied to clipboard!</Text>}

          <View style={{ marginTop: 30, alignSelf: 'stretch' }}>
            <Text style={styles.offerTitle}>Here's what to do</Text>
            {Array.isArray(refferalData?.refer_content)
              ? refferalData.refer_content.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))
              : null}
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share Referral Code</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ReferAndEarnScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientContainer: {
    paddingVertical: responsiveHeight(3),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  backButton: {
    marginRight: responsiveWidth(5),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  loginRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  loginRequiredContent: {
    alignItems: 'center',
    maxWidth: responsiveWidth(80),
  },
  loginRequiredTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginRequiredMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#117943',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: responsiveWidth(5),
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginVertical: responsiveHeight(2),
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: responsiveHeight(4),
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#117943',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#000',
  },

  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  bulletPoint: {
    fontSize: 20,
    lineHeight: 24,
    color: '#117943',
    marginRight: 6,
  },

  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },

  code: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  copiedText: {
    color: 'green',
    marginBottom: 10,
  },
  shareButton: {
    backgroundColor: '#117943',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
