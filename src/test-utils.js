/* @flow */

/* eslint-disable no-param-reassign */

import {
    cloneDeep,
    isArray,
    forIn,
    isPlainObject,
    isError,
    isObjectLike,
    isString,
} from 'lodash';

// https://stackoverflow.com/a/1527820
function getRandomInt(min: number = 1, max: number = 1000000000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

type RemoveStringArgs = {
    source: *,
    pattern: string,
    replaceWith?: string,
};

function removeString(args: RemoveStringArgs) {
    const { source, pattern = '', replaceWith = '' } = args;

    if (!isObjectLike(source) && !isString(source)) {
        return source;
    }

    const regex = new RegExp(pattern, 'g');

    /**
     * Unknown how to modify the error.stack. Just return the message for testing purposes with an Error: key
     */
    if (isError(source)) {
        return {
            Error: source.message.replace(regex, replaceWith),
        };
    }

    const newObj = cloneDeep(source);

    /**
     * Handle nested errors
     *
     * https://gist.github.com/tushariscoolster/567c1d22ca8d5498cbc0
     */
    const traverse = (obj) => {
        if (isString(obj)) {
            return obj.replace(regex, replaceWith);
        }

        return forIn(obj, (val, key) => {
            if (isArray(val)) {
                val.forEach((el, index) => {
                    if (isPlainObject(el)) {
                        traverse(el);
                    }

                    if (isError(el)) {
                        obj[key][index] = {
                            Error: el.message.replace(regex, replaceWith),
                        };
                    }

                    if (isString(el)) {
                        obj[key][index] = el.replace(regex, replaceWith);
                    }
                });
            }

            if (isPlainObject(val)) {
                traverse(obj[key]);
            }

            if (isError(val)) {
                obj[key] = {
                    Error: val.message.replace(regex, replaceWith),
                };
            }

            if (isString(val)) {
                obj[key] = val.replace(regex, replaceWith);
            }
        });
    };

    const result = traverse(newObj);

    return result;
}

const normalizeRootPath = (source: any = '', cwd: ?string) => {
    const pattern = cwd || process.cwd();

    return removeString({
        source,
        pattern,
        replaceWith: '/normalized/root/path',
    });
};

function getFunctionNames(mergedPreset: any) {
    const data = mergedPreset;

    const getName = (item) => {
        if (isPlainObject(item) && item.name && item.task) {
            return item.name;
        }

        if (isObjectLike(item)) {
            return item;
        }

        if (isString(item)) {
            return item;
        }

        return item.name;
    };

    const result = Object.keys(data).reduce((acc, current) => {
        const matched = data[current];
        if (isPlainObject(matched)) {
            return { ...acc, [current]: matched };
        }

        const updated = matched.map((fn) => {
            if (Array.isArray(fn)) {
                return fn.map((arrayOfFunctions) => {
                    return getName(arrayOfFunctions);
                });
            }

            return getName(fn);
        });

        return { ...acc, [current]: updated };
    }, {});

    return normalizeRootPath(result);
}

export { getFunctionNames, getRandomInt, normalizeRootPath, removeString };
