import { EPermissaoAcesso } from "../types/enum";

function todasPermissoes(nec: EPermissaoAcesso[], perm: EPermissaoAcesso[]) {
  if (nec.length === 0) return true;

  return nec.every((item) => perm.includes(item));
}

function algumaPermissao(nec: EPermissaoAcesso[], perm: EPermissaoAcesso[]) {
  if (nec.length === 0) return true;

  return nec.some((item) => perm.includes(item));
}

export default {
  todasPermissoes,
  algumaPermissao,
}