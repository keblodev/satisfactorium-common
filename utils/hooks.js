
import {useEffect, useState, lazy}  from 'react';
import { useSelector }              from 'react-redux';

import {device, locale} from 'common/statics';
import {updateLocale}           from 'common/utils/locale';

const defaultLocale = {
    name:       locale.LOCALE_TYPE_ENG,
    code:       'en-us',
    lang:       'en',
    loaded:     'false',
    tb:         false,
  };

function getRelativePath(fullPath = 'src/') {
  const rootPathReg = new RegExp(/^src\//)
  const nonRootReg = new RegExp(/(^(.+?)){0,}src\//)
  if (rootPathReg.test(fullPath)) {
    // src/my/component
    return fullPath.replace(rootPathReg, '')
  } else if (nonRootReg.test(fullPath)) {
    // if paths is like /something/else/here/src/my/component
    return fullPath.replace(/(^(.+?)){0,}src\//,'')
  } else if (!!fullPath) {
    // no src in the path
    return fullPath
  } else {
    throw Error(`lang import fullPath is empty`)
  }
}

export const useLocale = (
  fullPath = 'src/',
  config = {}
) => {
  const relativePath = getRelativePath(fullPath)
  let {rootKey} = config;

  if (!rootKey) {
    const rootKeyMatch = relativePath.match(/(?!\/)([A-Za-z-]+)/g);

    if (!rootKeyMatch) {
      throw Error(`no component locale rootKey found in ${fullPath}`)
    }

    rootKey = rootKeyMatch.pop();
  }

  let {locale:selectedLocale} = config;
  //INFO: no if-else here cuz react hooks cannot be called conditionally
  const stateLocale = useSelector(store => (store.root && store.root.ux.locale.selected));

  selectedLocale = selectedLocale || stateLocale || defaultLocale;

  const [updatingLocale, setUpdatingLocale] = useState(false);
  useEffect(() => {
    setUpdatingLocale(true);
    updateLocale({
      rootKey,
      code:       selectedLocale.code,
      path:       `${relativePath}/l18n`,
      cb:         () => setUpdatingLocale(false),
    })
  }, [selectedLocale]);

  return {locale: selectedLocale, isLocaleUpdating: updatingLocale};
}

const getView = (isMobile, relativePath = '') => lazy(() => isMobile ? import(`src/${relativePath}/mobile`) : import(`src/${relativePath}/desktop`))

export const useView = function (fullPath = 'src/') {
  const relativePath = fullPath.replace(/^src\//,'')
  const factor = useSelector(state => state.root.ux.device.factor);

  const isMobile = factor === device.DEVICE_FORM_FACTORS.MOBILE || factor === device.DEVICE_FORM_FACTORS.TABLET;
  const [View, setView] = useState(getView(isMobile, relativePath));

  useEffect(()=>{
    setView(getView(isMobile, relativePath));
  }, [factor]);

  return {
    View,
    isMobile
  }
}
