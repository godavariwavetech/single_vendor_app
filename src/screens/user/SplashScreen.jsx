import { SafeAreaView, StyleSheet, View, Image, Text, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setInitial } from '../../redux/reducers/auth'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'

const SplashScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.Auth);
  const { rehydrated } = useSelector(state => state.Auth._persist);
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setInitial())
    let timer
    if (rehydrated) {
      timer = setTimeout(() => {
        if (!token) {
          navigation.replace('OnboardingScreen');
        }
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [token, rehydrated]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#117943" barStyle="light-content" />
      <View style={styles.imgContainer}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../daddy/tabassets/singlevendorlogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Single Vendor</Text>
      </View>
    </SafeAreaView>
  )
}
export default SplashScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#117943',
  },
  imgContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoBadge: {
    width: responsiveWidth(44),
    borderRadius: responsiveWidth(4.5),
    backgroundColor: '#fff',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2.2),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: responsiveWidth(34),
    height: responsiveWidth(34) * 0.675,
  },
  appName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: responsiveHeight(3),
  }
})
