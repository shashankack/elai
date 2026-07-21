import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions } from 'react-native';

import { DrawerContent } from '@/components/drawer-content';
import { Colors } from '@/constants/theme';

export default function DrawerLayout() {
  const colors = Colors.light;
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(340, Math.round(width * 0.86));

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerStyle: {
          backgroundColor: colors.background,
          width: drawerWidth,
        },
        overlayColor: 'rgba(46, 62, 32, 0.4)',
        swipeEdgeWidth: 40,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Shop',
          title: 'ELAI',
        }}
      />
    </Drawer>
  );
}
