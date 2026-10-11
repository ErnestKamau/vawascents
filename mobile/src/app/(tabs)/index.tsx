import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Bell, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { softWhite } from '@/design';
import { Screen, Text, Avatar, SearchBar, ProductCard, Skeleton, ImageCarousel, IconButton, StackedCards, SideDrawer, MediaInfoCard } from '@/components/ui';
import { CATEGORIES, MOCK_PRODUCTS } from '@/data/mockProducts';

const PROMOS = [
  {
    eyebrow: '30% OFF TODAY',
    headline: 'Made with\nprecise\nrealization',
    imageUri: MOCK_PRODUCTS[5].imageUri,
  },
  {
    eyebrow: 'NEW ARRIVAL',
    headline: 'Discover your\nsignature scent',
    imageUri: MOCK_PRODUCTS[0].imageUri,
  },
];

export default function HomeScreen() {
  const theme = useAppTheme();
  const { user } = useAuth();
  const toast = useToast();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>('All');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuredSaved, setFeaturedSaved] = useState(false);
  const featured = MOCK_PRODUCTS.slice(0, 3);
  const bestSellers = MOCK_PRODUCTS;
  const spotlight = MOCK_PRODUCTS[2];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[13], gap: theme.spacing[7] }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: theme.spacing[4] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4], flex: 1 }}>
            <IconButton
              icon={<Menu size={20} color={theme.colors.text} />}
              onPress={() => setMenuOpen(true)}
              accessibilityLabel="Menu"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            />
            <View>
              <Text variant="overline" color="muted">
                GOOD DAY
              </Text>
              <Text variant="h2" style={{ fontFamily: theme.fontFamily.display.extraBold }}>
                {user?.name?.split(' ')[0] ?? 'Guest'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
            <IconButton
              icon={<Bell size={20} color={theme.colors.text} />}
              onPress={() => {}}
              accessibilityLabel="Notifications"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            />
            <Avatar name={user?.name ?? 'Guest'} size={44} />
          </View>
        </View>

        <SearchBar value={search} onChangeText={setSearch} />

        <ImageCarousel
          slides={PROMOS.map((p) => ({ uri: p.imageUri }))}
          aspectRatio={16 / 10}
          borderRadius={theme.radius.xl}
          overlay={(index) => {
            const promo = PROMOS[index];
            return (
              <LinearGradient
                colors={['rgba(12,8,18,0.05)', 'rgba(12,8,18,0.78)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end', padding: theme.spacing[6] }}
                pointerEvents="box-none"
              >
                <Text variant="overline" style={{ color: theme.colors.gold, marginBottom: theme.spacing[2] }}>
                  {promo.eyebrow}
                </Text>
                <Text variant="h2" style={{ color: softWhite.primary, fontFamily: theme.fontFamily.display.extraBold, marginBottom: theme.spacing[4] }}>
                  {promo.headline}
                </Text>
                <Pressable
                  onPress={() => router.push('/products' as any)}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      gap: theme.spacing[2],
                      backgroundColor: theme.colors.gold,
                      paddingHorizontal: theme.spacing[5],
                      height: 44,
                      borderRadius: theme.radius.pill,
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? theme.pressScale : 1 }],
                    },
                  ]}
                >
                  <Text variant="button" style={{ color: theme.colors.textOnPrimary }}>
                    Shop now
                  </Text>
                  <ArrowRight size={16} color={theme.colors.textOnPrimary} />
                </Pressable>
              </LinearGradient>
            );
          }}
        />

        <View style={{ gap: theme.spacing[3] }}>
          <Text variant="title">Spotlight</Text>
          <View style={{ marginHorizontal: -theme.spacing[5] }}>
            <MediaInfoCard
              imageUri={spotlight.imageUri}
              rating={spotlight.rating}
              statusLabel="In stock"
              title={spotlight.name}
              subtitle={`${spotlight.brand} · ${spotlight.volumeMl} ml`}
              price={spotlight.price}
              primaryLabel="View"
              height={280}
              saved={featuredSaved}
              onHeartPress={() => {
                const next = !featuredSaved;
                setFeaturedSaved(next);
                if (next) toast.success('Added to wishlist', spotlight.name);
                else toast.info('Removed from wishlist', spotlight.name);
              }}
              onPress={() => router.push(`/product/${spotlight.id}` as any)}
              onPrimaryPress={() => router.push(`/product/${spotlight.id}` as any)}
            />
          </View>
        </View>

        <View style={{ gap: theme.spacing[3] }}>
          <Text variant="title">Shop by category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
              {CATEGORIES.map((c) => {
                const selected = c === category;
                return (
                  <Pressable
                    key={c}
                    onPress={() => {
                      setCategory(c);
                      if (c !== 'All') router.push(`/products?category=${c}` as any);
                    }}
                    style={{
                      paddingHorizontal: theme.spacing[5],
                      height: 40,
                      borderRadius: theme.radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? theme.colors.primaryMuted : theme.colors.backgroundSecondary,
                      borderWidth: selected ? 1.5 : 0,
                      borderColor: theme.colors.primary,
                    }}
                  >
                    <Text variant="label" color={selected ? 'brand' : 'secondary'}>
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <Animated.View entering={FadeInDown.duration(theme.duration.normal)} style={{ gap: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="title">New arrivals</Text>
            <Text variant="label" color="brand" onPress={() => router.push('/products' as any)}>
              See all
            </Text>
          </View>
          {loading ? (
            <View style={{ flexDirection: 'row', gap: theme.spacing[4] }}>
              {[0, 1].map((i) => (
                <View key={i} style={{ width: 200, gap: theme.spacing[2] }}>
                  <Skeleton height={200} borderRadius={theme.radius.lg} />
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="40%" height={12} />
                </View>
              ))}
            </View>
          ) : (
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: theme.spacing[4] }}
              renderItem={({ item }) => (
                <View style={{ width: 200 }}>
                  <ProductCard
                    id={item.id}
                    name={item.name}
                    brand={item.brand}
                    volumeMl={item.volumeMl}
                    price={item.price}
                    compareAt={item.compareAt}
                    imageUri={item.imageUri}
                    onPress={() => router.push(`/product/${item.id}` as any)}
                  />
                </View>
              )}
            />
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(theme.duration.normal).delay(80)} style={{ gap: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="title">Best sellers</Text>
            <Text variant="label" color="brand" onPress={() => router.push('/products' as any)}>
              See all
            </Text>
          </View>
          {loading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3] }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ width: '47%', gap: theme.spacing[2] }}>
                  <Skeleton height={160} borderRadius={theme.radius.lg} />
                  <Skeleton width="80%" height={14} />
                  <Skeleton width="50%" height={12} />
                </View>
              ))}
            </View>
          ) : (
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
                  onPress={() => router.push(`/product/${item.id}` as any)}
                />
              ))}
            </View>
          )}
        </Animated.View>

        <StackedCards
          images={[
            { uri: MOCK_PRODUCTS[0].imageUri },
            { uri: MOCK_PRODUCTS[3].imageUri },
            { uri: MOCK_PRODUCTS[5].imageUri },
          ]}
          caption={'Crafted at the intersection of\nscent, mood, and ritual.'}
          ctaLabel="Find your signature scent"
          onPress={() => router.push('/products' as any)}
        />
      </ScrollView>

      <SideDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </Screen>
  );
}
