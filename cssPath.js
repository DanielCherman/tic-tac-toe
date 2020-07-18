const isElement = (x) => x && x.nodeType === Node.ELEMENT_NODE;

const nthChild = (el, nth = 1) => {
  if (el) {
    return nthChild(el.previousSibling, nth + 1);
  } else {
    return nth - 1;
  }
};

export const cssPath = (el, path = []) => {
  if (isElement(el)) {
    const tag = el.nodeName.toLowerCase(),
      id = el.id.length != 0 && el.id;
    if (id) {
      return cssPath(null, path.concat([`#${id}`]));
    } else {
      return cssPath(
        el.parentNode,
        path.concat([`${tag}:nth-child(${nthChild(el)})`])
      );
    }
  } else {
    return path.reverse().join(" > ");
  }
};

export default cssPath;
