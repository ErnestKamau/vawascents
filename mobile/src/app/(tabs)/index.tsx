import React from 'react';
import { View, ScrollView, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Bell, Sparkles } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Screen, Text, Avatar, SearchBar, Badge, GlassSurface, ProductCard } from '@/components/ui';
import { CATEGORIES, MOCK_PRODUCTS } from '@/data/mockProducts';

export default function HomeScreen() {
  const theme = useAppTheme();
  const { user } = useAuth();
  const [search, setSearch] = React.useState('');
  const featured = MOCK_PRODUCTS.slice(0, 2);
  const bestSellers = MOCK_PRODUCTS;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[13], gap: theme.spacing[6] }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: theme.spacing[4] }}>
          <View>
            <Text variant="caption" color="muted">
              Good day
            </Text>
            <Text variant="h3">{user?.name ?? 'Guest'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
            <Bell size={22} color={theme.colors.text} />
            <Avatar name={user?.name ?? 'Guest'} size={40} />
          </View>
        </View>

        <SearchBar value={search} onChangeText={setSearch} />

        <Pressable onPress={() => router.push('/wallet' as any)}>
          <GlassSurface level={2} borderRadius={theme.radius.xl}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: theme.spacing[5],
              }}
            >
              <View style={{ gap: theme.spacing[1] }}>
                <Text variant="overline" color="gold">
                  WALLET
                </Text>
                <Text variant="h3">KES 0.00</Text>
                <Text variant="caption" color="muted">
                  Powered by Equity Pesalink
                </Text>
              </View>
              <Sparkles size={28} color={theme.colors.gold} />
            </View>
          </GlassSurface>
        </Pressable>

        <View style={{ gap: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="title">New arrivals</Text>
            <Text variant="label" color="brand" onPress={() => router.push('/products' as any)}>
              See all
            </Text>
          </View>
          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: theme.spacing[4] }}
            renderItem={({ item }) => (
              <View style={{ width: 220 }}>
                <ProductCard
                  id={item.id}
                  name={item.name}
                  brand={item.brand}
                  volumeMl={item.volumeMl}
                  price={item.price}
                  compareAt={item.compareAt}
                  imageUri={item.imageUri}
                  onPress={() => router.push(`/products?focus=${item.id}` as any)}
                />
              </View>
            )}
          />
        </View>

        <View style={{ gap: theme.spacing[3] }}>
          <Text variant="title">Shop by category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
              {CATEGORIES.map((c) => (
                <Pressable key={c} onPress={() => router.push(`/products?category=${c}` as any)}>
                  <Badge label={c} intent={c === 'All' ? 'brand' : 'neutral'} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ gap: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="title">Best sellers</Text>
            <Text variant="label" color="brand" onPress={() => router.push('/products' as any)}>
              See all
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3] }}>
            {bestSellers.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                brand={item.brand}
                volumeMl={item.volumeMl}
                price={item.price}
                compareAt={item.compareAt}
                imageUri={item.imageUri}
                onPress={() => router.push(`/products?focus=${item.id}` as any)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
