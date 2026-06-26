import { Dimensions } from 'react-native';
export const { width: SW, height: SH } = Dimensions.get('window');

export const C = {
  dark:       '#1a1a2e',
  blue:       '#4f7de3',
  green:      '#2ecc71',
  greenLight: '#e6f7ef',
  greenDark:  '#1d6b41',
  red:        '#e74c3c',
  redLight:   '#fff0f0',
  redDark:    '#c0392b',
  amber:      '#f39c12',
  amberLight: '#fffbea',
  bg:         '#f0f0f0',
  white:      '#ffffff',
  cardBg:     '#f8f8fb',
  border:     '#ebebeb',
  muted:      '#999999',
  sub:        '#555555',
  line:       '#f0f0f0',
};

export const statusColor = (status: string) => {
  switch (status) {
    case 'safe':    return { text: C.green,  bg: C.greenLight };
    case 'danger':  return { text: C.red,    bg: C.redLight   };
    case 'warning': return { text: C.amber,  bg: C.amberLight };
    default:        return { text: C.muted,  bg: C.cardBg     };
  }
};

export const riskColor = (score: number) =>
  score >= 70 ? C.red : score >= 40 ? C.amber : C.green;
