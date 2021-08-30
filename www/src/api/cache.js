
import {
    findTemplate
} from './api';

/// 模板cache
const KTemplateData = {
    '1595310806940367327': [],
    '1595397637628133418': [],
    '1595077654714716554': [],
    '1595077405589137749': []
};

const findTemplateWithCache = async (templateUid) => {
    let templateList = KTemplateData[templateUid];
    if (templateList.length > 0) {
        return { errCode: 0, list: templateList };
    }

    let findResult = await findTemplate(templateUid);
    if (findResult.errCode === 0 && findResult.list.length > 0) {
        KTemplateData[templateUid] = findResult.list;
        return findResult;
    }

    return { errCode: -1 };
};

export { findTemplateWithCache }