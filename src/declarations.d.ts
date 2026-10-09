declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-html-to-pdf';
declare module 'react-native-print';
declare module 'react-native-share';
