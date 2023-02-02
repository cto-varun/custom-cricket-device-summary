"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const getProfilesAvailable = (profileInfo, imsiCategory) => {
  const profile = window[sessionStorage.tabId]?.COM_IVOYANT_VARS?.profile;
  const profiles = profileInfo['profiles'];
  const profileCategories = profiles.filter(x => x.name === profile);
  const isProfileAvailable = imsiCategory ? profileCategories[0]?.categories?.filter(x => x.name === imsiCategory['category']) : false;
  return isProfileAvailable ? isProfileAvailable[0]?.enable : false;
};
var _default = getProfilesAvailable;
exports.default = _default;