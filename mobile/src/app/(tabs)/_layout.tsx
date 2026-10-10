import React from 'react';
import { Tabs } from 'expo-router/tabs';
import { Home, ShoppingBag, ReceiptText, User } from 'lucide-react-native';
import { GlassTabBar } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';

export default function TabsLayout() {
  const { itemCount } = useCart();

  return (
    <Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <ReceiptText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
