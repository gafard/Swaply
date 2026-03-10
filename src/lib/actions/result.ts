export type ActionSuccess<TCode extends string, TData = undefined> = {
  ok: true;
  code: TCode;
  data?: TData;
};

export type ActionFailure<TCode extends string, TData = undefined> = {
  ok: false;
  code: TCode;
  data?: TData;
};

export type ActionResult<TCode extends string, TData = undefined> =
  | ActionSuccess<TCode, TData>
  | ActionFailure<TCode, TData>;

export function actionOk<TCode extends string, TData = undefined>(
  code: TCode,
  data?: TData
): ActionSuccess<TCode, TData> {
  return data === undefined ? { ok: true, code } : { ok: true, code, data };
}

export function actionFail<TCode extends string, TData = undefined>(
  code: TCode,
  data?: TData
): ActionFailure<TCode, TData> {
  return data === undefined ? { ok: false, code } : { ok: false, code, data };
}
