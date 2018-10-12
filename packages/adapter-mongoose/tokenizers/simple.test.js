const tokenizerFactory = require('./simple');

describe('Simple tokenizer', () => {
  test('Uses correct conditions', () => {
    const simpleConditions = { name: () => ({ foo: 'bar' }) };
    const getSimpleQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ getSimpleQueryConditions }));

    const simple = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
    });

    expect(simple({ name: 'hi' }, 'name', ['name'])).toMatchObject({ pipeline: [{ foo: 'bar' }] });
    expect(getSimpleQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('Falls back to modifier conditions when no simple condition found', () => {
    const simpleConditions = { notinuse: () => ({ foo: 'bar' }) };
    const modifierConditions = { name: () => ({ zip: 'quux' }) };
    const getSimpleQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ getSimpleQueryConditions }));

    const simple = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
      modifierConditions,
    });

    expect(simple({ name: 'hi' }, 'name', ['name'])).toMatchObject({
      postJoinPipeline: [{ zip: 'quux' }],
    });
    expect(getSimpleQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const simpleConditions = { notinuse: () => ({ foo: 'bar' }) };
    const modifierConditions = { idontexist: () => ({ zip: 'quux' }) };
    const getSimpleQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ getSimpleQueryConditions }));

    const simple = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
      modifierConditions,
    });

    const result = simple({ name: 'hi' }, 'name', ['name']);
    expect(result).toMatchObject({});
    expect(getSimpleQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('calls condition function with correct parameters', () => {
    const nameConditions = jest.fn(() => ({ foo: 'bar' }));
    const simpleConditions = { name: nameConditions };
    const getSimpleQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ getSimpleQueryConditions }));

    const simple = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
    });

    expect(simple({ name: 'hi' }, 'name', ['name'])).toMatchObject({ pipeline: [{ foo: 'bar' }] });
    expect(getSimpleQueryConditions).toHaveBeenCalledTimes(1);
    expect(nameConditions).toHaveBeenCalledTimes(1);
    expect(nameConditions).toHaveBeenCalledWith('hi', { name: 'hi' });
  });
});
