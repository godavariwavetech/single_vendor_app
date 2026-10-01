import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { setInitial } from '../../redux/reducers/auth';

const SplashScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.Auth);
  const { rehydrated } = useSelector(state => state.Auth._persist);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setInitial());
    let timer;
    if (rehydrated) {
      timer = setTimeout(() => {
        if (!token) {
          navigation.replace('OnboardingScreen');
        }
      }, 800);
    }
    return () => clearTimeout(timer);
  }, [dispatch, navigation, token, rehydrated]);


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0B5E35" barStyle="light-content" hidden />
      <LinearGradient
        colors={['#117943', '#0B6538', '#084F30']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />
      <View style={styles.imgContainer}>
        <View style={styles.brandPill}>
          <View style={styles.brandDot} />
          <Text style={styles.brandPillText}>YOUR NEIGHBOURHOOD MARKET</Text>
        </View>
        <View style={styles.logoBadge}>
          <Image
            source={require('../daddy/tabassets/singlevendorlogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Single Vendor</Text>
        <Text style={styles.tagline}>Good food, delivered fresh.</Text>
      </View>
      <Text style={styles.footer}>FRESH PICKS · EVERY DAY</Text>
    </View>
  );
};
export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0B6538',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  orbTop: {
    width: responsiveWidth(88),
    height: responsiveWidth(88),
    top: -responsiveWidth(32),
    right: -responsiveWidth(28),
  },
  orbBottom: {
    width: responsiveWidth(110),
    height: responsiveWidth(110),
    bottom: -responsiveWidth(56),
    left: -responsiveWidth(48),
  },
  imgContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: responsiveHeight(3),
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.26)',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: responsiveHeight(3),
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BDE5C8',
    marginRight: 8,
  },
  brandPillText: {
    color: '#E1F2E5',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  logoBadge: {
    width: responsiveWidth(62),
    height: responsiveWidth(42),
    maxWidth: 260,
    maxHeight: 176,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
  logoImage: {
    width: '84%',
    height: '84%',
  },
  appName: {
    color: '#fff',
    fontSize: 29,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: responsiveHeight(3),
  },
  tagline: {
    color: '#D5EBDD',
    fontSize: 15,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  footer: {
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: responsiveHeight(5),
  },
});
