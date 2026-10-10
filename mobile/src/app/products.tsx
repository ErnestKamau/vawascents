import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Screen, Text, IconButton, SearchBar, Badge, ProductCard } from '@/components/ui';
import { CATEGORIES, MOCK_PRODUCTS } from '@/data/mockProducts';

export default function ProductsScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(params.category ?? 'All');

  const products = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: theme.spacing[5], gap: theme.spacing[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], paddingTop: theme.spacing[2] }}>
          <IconButton icon={<ArrowLeft size={20} color={theme.colors.text} />} onPress={() => router.back()} accessibilityLabel="Back" />
          <Text variant="h3">Fragrances</Text>
        </View>

        <SearchBar value={search} onChangeText={setSearch} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} onPress={() => setCategory(c)}>
                <Badge label={c} intent={category === c ? 'brand' : 'neutral'} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing[5],
          paddingTop: theme.spacing[4],
          paddingBottom: theme.spacing[9],
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[3],
        }}
      >
        {products.length === 0 ? (
          <Text variant="body" color="muted" style={{ marginTop: theme.spacing[8] }}>
            No fragrances match your search.
          </Text>
        ) : (
          products.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              brand={item.brand}
              volumeMl={item.volumeMl}
              price={item.price}
              compareAt={item.compareAt}
              imageUri={item.imageUri}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
