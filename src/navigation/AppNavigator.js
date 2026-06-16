import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Home, Map, Heart, ClipboardList, User } from 'lucide-react-native';

import { colors } from '../theme';

// Tab Screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import LikedScreen from '../screens/LikedScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import MyPageScreen from '../screens/MyPageScreen';

// Stack Screens
import ProductDetailScreen from '../screens/ProductDetailScreen';
import StoreScreen from '../screens/StoreScreen';
import OrderScreen from '../screens/OrderScreen';
import OrderCompleteScreen from '../screens/OrderCompleteScreen';
import ReviewScreen from '../screens/ReviewScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import NotificationScreen from '../screens/NotificationScreen';
import CouponScreen from '../screens/CouponScreen';
import MyOrderListScreen from '../screens/MyOrderListScreen';
import TermsScreen from '../screens/TermsScreen';
import SearchScreen from '../screens/SearchScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabBarIcon({ Icon, focused, label }) {
  return (
    <View style={styles.tabItem}>
      <Icon size={22} color={focused ? colors.primaryGreen : colors.mediumGray} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}
    >
      <Tab.Screen
        name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon Icon={Home} focused={focused} label="홈" /> }}
      />
      <Tab.Screen
        name="Map" component={MapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon Icon={Map} focused={focused} label="지도" /> }}
      />
      <Tab.Screen
        name="Liked" component={LikedScreen}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon Icon={Heart} focused={focused} label="찜" /> }}
      />
      <Tab.Screen
        name="Orders" component={OrderHistoryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon Icon={ClipboardList} focused={focused} label="주문내역" /> }}
      />
      <Tab.Screen
        name="MyPage" component={MyPageScreen}
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon Icon={User} focused={focused} label="마이" /> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
        <Stack.Screen name="Order" component={OrderScreen} />
        <Stack.Screen name="OrderComplete" component={OrderCompleteScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="Coupons" component={CouponScreen} />
        <Stack.Screen name="MyOrders" component={MyOrderListScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 80 : 62,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: { fontSize: 10, color: colors.mediumGray },
  tabLabelActive: { color: colors.primaryGreen, fontWeight: '700' },
});
