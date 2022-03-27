
/// Following adapted from https://github.com/react-native-nigeria-community/Lighten-Darken-Color/pull/3

export function shade(color, amount: number){
  var usePound = false;

  if (color[0] == '#') {
      color = color.slice(1);
      usePound = true;
  }

  var num = parseInt(color,16);

  var r = (num >> 16) + amount;

  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amount;

  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  var g = (num & 0x0000FF) + amount;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  const str = (g | (b << 8) | (r << 16)).toString(16);    
  return  (usePound ? '#' : '')  + ('000000' + str).substring(str.length, str.length + 6);    
}
