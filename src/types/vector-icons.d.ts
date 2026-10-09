declare module 'react-native-vector-icons/Icon' {
  import { ReactNode, Component } from 'react';
  import { ViewProps } from 'react-native';
  export interface IconProps extends ViewProps {
    name: string;
    size?: number;
    color?: string;
    children?: ReactNode;
  }
  export class Icon extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/AntDesign' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class AntDesign extends Icon {}
}

declare module 'react-native-vector-icons/Entypo' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class Entypo extends Icon {}
}

declare module 'react-native-vector-icons/EvilIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class EvilIcons extends Icon {}
}

declare module 'react-native-vector-icons/Feather' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class Feather extends Icon {}
}

declare module 'react-native-vector-icons/FontAwesome' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class FontAwesome extends Icon {}
}

declare module 'react-native-vector-icons/FontAwesome5' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class FontAwesome5 extends Icon {}
}

declare module 'react-native-vector-icons/FontAwesome6' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class FontAwesome6 extends Icon {}
}

declare module 'react-native-vector-icons/Fontisto' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class Fontisto extends Icon {}
}

declare module 'react-native-vector-icons/Foundation' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class Foundation extends Icon {}
}

declare module 'react-native-vector-icons/Ionicons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class Ionicons extends Icon {}
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class MaterialIcons extends Icon {}
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class MaterialCommunityIcons extends Icon {}
}

declare module 'react-native-vector-icons/Octicons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class Octicons extends Icon {}
}

declare module 'react-native-vector-icons/SimpleLineIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class SimpleLineIcons extends Icon {}
}

declare module 'react-native-vector-icons/Zocial' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class Zocial extends Icon {}
}
