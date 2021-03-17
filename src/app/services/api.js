import { metaModals, metaFields, data } from '../data';

export async function getMetaModals({ search = '' }) {
  return Promise.resolve(
    metaModals.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
  );
}

export async function getMetaFields(fields, model) {
  const modalFields = model && metaFields.filter((i) => i.modal === model)[0];
  return Promise.resolve(modalFields && modalFields.fields);
}

export async function getMetaModal(data) {
  const { fieldName, value } = data.criteria[0];
  return Promise.resolve(metaModals.filter((i) => i[fieldName] === value)[0]);
}

export async function getSubMetaField(model) {
  const modalFields = model && metaFields.filter((i) => i.modal === model)[0];
  return Promise.resolve(modalFields && modalFields.fields);
}

export async function getData(model) {
  const records = data && data.filter((i) => i.model == model)[0];
  return Promise.resolve(records && records.data);
}
