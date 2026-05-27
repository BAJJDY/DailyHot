// 特殊 logo 文件名映射
const logoMap = {
  "52pojie": "/logo/wuaipojie.jpg",
  csdn: "/logo/csdn.jpg",
};

export const getLogoUrl = (name) => {
  return logoMap[name] ?? `/logo/${name}.png`;
};
