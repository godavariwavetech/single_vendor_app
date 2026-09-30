import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
  RefreshControl,
  UIManager,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from '../../components/CustomModal';
import { actionLogout } from '../../redux/reducers/auth';
import { clearCart, getOrders } from '../../redux/reducers/daddy';
import VersionCheck from 'react-native-version-check';
import FocusAwareStatusBar from '../../components/CustomStatusBar';
import UserProfileScreen from '../user/ProfileScreen';
import { deleteAccount } from '../../services/services';
import { resetWallet } from '../../redux/reducers/walletSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { customerId, username, userDetails, storeData } = useSelector(state => state.Auth);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const insets = useSafeAreaInsets();


  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
  // Favorites state
  const [favorites, setFavorites] = useState([]);
  useFocusEffect(useCallback(() => {
  }, []))

  // Load favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    const getVersion = async () => {
      try {
        const version = await VersionCheck.getCurrentVersion();

        setAppVersion(version);
      } catch (error) {

      }
    };
    getVersion();
  }, []);

  const handleUpdate = async () => {
    try {
      await Linking.openURL(
        'https://play.google.com/store/apps/details?id=com.singlevendor',
      );
    } catch (error) {

    } finally {
      setShowUpdateModal(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteModalVisible(false);

      // ✅ Call your API for account deletion
      const response = await deleteAccount({ user_id: customerId });

      // ✅ Clear redux store
      dispatch(actionLogout());
      dispatch(clearCart());
      dispatch(resetWallet())

      // ✅ Navigate to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Delete Account Error:", error);
      Alert.alert("Error", error?.message || "Something went wrong while deleting account.");
    }
  };


  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(actionLogout());
    dispatch(clearCart());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleCheckForUpdate = async () => {
    try {
      const res = await VersionCheck.needUpdate();
      if (res.isNeeded) {
        setShowUpdateModal(true);
      } else {
        setUpdateModalVisible(true); // Show "latest version" modal
        setShowUpdateModal(false); // Ensure update modal is hidden
      }
    } catch (error) {

      setUpdateModalVisible(true); // Show error message
      setShowUpdateModal(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          // onRefresh={getOrdersData}
          colors={['#117943']}
        />
      }
    >
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#117943" />
      <LinearGradient
        colors={['#117943', '#117943']}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginLeft: responsiveWidth(2),
          }}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfileScreen')}>
            <Image
              source={{
                uri: userDetails?.profile_image || 'https://skiblue.co.uk/wp-content/uploads/2015/06/dummy-profile.png',
              }}
              style={{
                width: responsiveWidth(10),
                height: responsiveWidth(10),
                borderRadius: 100,
              }}
            />
          </TouchableOpacity>
          <Text style={styles.profileName}>
            {userDetails?.customer_name || username || 'Hello User'}
          </Text>
        </View>
      </LinearGradient>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >


        <View style={styles.menuOptions}>
          {/* 👤 Account */}
          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('UserProfileScreen')}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="account-circle-outline" size={24} color="#117943" />
              <Text style={styles.menuText}>Account</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('AddressList')}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="account-circle-outline" size={24} color="#117943" />
              <Text style={styles.menuText}>Address</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('PreviousOrdersScreen', { fromProfile: true })}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#117943" />
              <Text style={styles.menuText}>Your Orders</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('MyFavoritesScreen')}>
            <View style={styles.menuItemLeft}>
              <Icon name="favorite" size={24} color="#117943" />
              <Text style={styles.menuText}>My Favorites</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* 💰 Offers & Referrals */}
          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('OffersScreen')}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="tag-outline" size={24} color="#117943" />
              <Text style={styles.menuText}>Offers</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('ReferAndEarnScreen')}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="gift-outline" size={24} color="#117943" />
              <Text style={styles.menuText}>Refer & Earn</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* ❓ Support & Info */}
          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('Support')}>
            <View style={styles.menuItemLeft}>
              <Feather name="user" size={24} color="#117943" />
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('FAQScreen')}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="help-circle-outline" size={24} color="#117943" />
              <Text style={styles.menuText}>FAQs</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('QualityFAQS')}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="check-decagram" size={24} color="#117943" />
              <Text style={styles.menuText}>Quality</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('HelthTips')}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color="#117943" />
              <Text style={styles.menuText}>Health Tips</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemMain} onPress={() => navigation.navigate('RefundPolicy')}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="cash-refund" size={22} color="#117943" />
              <Text style={styles.menuText}>Refund Policy</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* 🔓 Logout */}
          {customerId ? (
            // ✅ Show Logout
            <TouchableOpacity
              style={styles.menuItemMain}
              onPress={() => setLogoutModalVisible(true)}
            >
              <View style={styles.menuItemLeft}>
                <Feather name="log-out" size={24} color="#117943" />
                <Text style={styles.menuText}>Logout</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ) : (
            // ✅ Show Login
            <TouchableOpacity
              style={styles.menuItemMain}
              onPress={() => {
                navigation.navigate('Register1', { withoutLogin: true });
              }}
            >
              <View style={styles.menuItemLeft}>
                <Feather name="log-in" size={24} color="#117943" />
                <Text style={styles.menuText}>Login</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          )}


          {/* ❌ Delete Account */}

          {customerId && (
            <TouchableOpacity style={styles.menuItemMain} onPress={() => setDeleteModalVisible(true)}>
              <View style={styles.menuItemLeft}>
                <MaterialCommunityIcons name="delete-outline" size={24} color="red" />
                <Text style={[styles.menuText, { color: "red" }]}>Delete Account</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          )}

          {/* 🔢 App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>App Version: {appVersion || '1.0.0'}</Text>
          </View>
        </View>
      </ScrollView>

      <CustomModal
        visible={updateModalVisible}
        title={showUpdateModal ? 'Update Available' : 'App Updated'}
        message={
          showUpdateModal
            ? 'A new version is available. Please update now!'
            : "You're using the latest version of Abhi24"
        }
        confirmText="OK"
        onConfirm={() => setUpdateModalVisible(false)}
        showCancel={false}
        cancelText=""
      />
      <CustomModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
        confirmText="Logout"
        cancelText="Cancel"
      />
      <CustomModal
        visible={showUpdateModal}
        title="Update Available"
        message="A new version of Abhi 24 is available. Please update to continue using all features."
        confirmText="Update Now"
        onConfirm={handleUpdate}
        onCancel={() => setShowUpdateModal(false)}
        cancelText="Later"
      />

      <CustomModal
        visible={deleteModalVisible}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalVisible(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'ios' ? 85 : 60, // Add padding for tab bar
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Optional: if using React Native >= 0.71
  },
  menuText: {
    fontSize: 15,
    color: '#333',
  },
  header: { padding: 20, backgroundColor: '#117943', alignItems: 'center' },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  ordersTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAll: { color: '#117943', fontWeight: 'bold' },
  orderCard: {
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    // elevation: 3
  },
  orderId: { fontSize: 14, fontWeight: '500', color: '#3D3D3D' },
  orderStatus: { color: '#117943', fontWeight: '600', fontSize: 14 },
  orderDetails: {
    fontSize: 12,
    color: '#3D3D3D',
    fontWeight: '600',
    width: responsiveWidth(65),
    marginBottom: responsiveHeight(0.3),
  },
  orderDate: {
    fontSize: 12,
    color: '#525252',
    fontWeight: '400',
    marginBottom: responsiveHeight(0.3),
  },
  restaurantInfo: { marginVertical: 0 },
  restaurantName: { fontSize: 16, fontWeight: 'bold' },
  menuItem: { fontSize: 14, color: '#555' },
  price: {
    fontSize: 16,
    color: '#117943',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 10,
  },
  reorderButton: {
    backgroundColor: '#fff',
    // padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#A3A3A3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    width: responsiveWidth(38),
    // paddingHorizontal:20
  },
  rateButton: {
    backgroundColor: '#00773F',
    // padding: 5,
    borderRadius: 5,
    width: responsiveWidth(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#A3A3A3', fontWeight: 'bold' },
  menuOptions: {
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 85 : 60, // Add extra padding to menu options
    paddingTop: 0
  },
  menuItemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff', // or '#111' for dark mode
    borderRadius: 8,
    marginVertical: 6,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#222',
  },

  menuItemMain: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#A3A3A3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(3),
  },
  menuText: { fontSize: 16, color: '#000', fontWeight: '600', textAlign: 'left' },
  gradientContainer: {
    paddingVertical: 10,
  },
  dottedLineContainer: {
    flexDirection: 'row',
    marginTop: responsiveHeight(2),
    alignSelf: 'center',
  },
  dot: {
    width: 5, // Dot size
    height: 2,
    backgroundColor: '#D8D8D8', // Dot color
    borderRadius: 5, // Makes it circular
    marginHorizontal: 5, // Space between dots
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 20,
  },
  noOrdersText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#313131',
    marginTop: 15,
    marginBottom: 5,
  },
  noOrdersSubText: {
    fontSize: 14,
    color: '#A3A3A3',
    textAlign: 'center',
  },
  versionContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 7,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    left: 10,
  },
  versionText: {
    fontSize: 14,
    color: '#117943',
    fontWeight: '500',
    textAlign: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginPrompt: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#117943',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  // Favorites section styles
  sectionContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#117943',
    fontSize: 14,
    marginRight: 5,
  },
  emptyFavoritesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyFavoritesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  emptyFavoritesSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  favoritesScrollView: {
    paddingHorizontal: 5,
  },
  favoriteItemCard: {
    width: 120,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  favoriteItemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  favoriteItemName: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
  favoriteItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#117943',
  },
  recentOrderContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentOrderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recentOrderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentOrderDetails: {
    flexDirection: 'column',
  },
  recentOrderId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3D3D3D',
  },
  recentOrderPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#117943',
  },
  recentOrderItemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentOrderItemPreview: {
    padding: 5,
  },
  recentOrderItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    color: '#117943',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;