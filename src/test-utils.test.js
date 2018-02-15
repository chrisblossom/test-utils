/* @flow */

import path from 'path';
import { normalizeRootPath, removeString } from './test-utils';

describe('removeString', () => {
    it('removes from object', () => {
        const source = {
            one: {
                two: {
                    three: '/remove/this/but/not/this/',
                },
            },
        };

        const pattern = '/remove/this/';

        const result = removeString({ source, pattern });

        expect(result).toMatchSnapshot();
    });

    it('removes from string', () => {
        const source = '/remove/this/but/not/this/';

        const pattern = '/remove/this/';

        const result = removeString({ source, pattern });

        expect(result).toEqual('but/not/this/');
    });

    it('adds replaceWith', () => {
        const source = '/remove/this/but/not/this/';

        const pattern = '/remove/this/';

        const result = removeString({
            source,
            pattern,
            replaceWith: '/replace/with/this/',
        });

        expect(result).toEqual('/replace/with/this/but/not/this/');
    });

    it('handles undefined', () => {
        const source = undefined;

        const pattern = '/remove/this/';

        const result = removeString({ source, pattern });

        expect(result).toEqual(undefined);
    });

    it('handles Error', () => {
        const source = new Error('/remove/this/but/not/this/');

        const pattern = '/remove/this/';

        const result = removeString({ source, pattern });

        expect(result).toMatchSnapshot();
    });

    it('handles Error deep in array', () => {
        const source = [
            '/remove/this/but/not/this/first/',
            new Error('/remove/this/but/not/this/second'),
        ];

        const pattern = '/remove/this/';

        const result = removeString({ source, pattern });

        expect(result).toMatchSnapshot();
    });

    it('handles Errors deep in object', () => {
        const source = {
            inside: {
                another: {
                    error: new Error('/remove/this/but/not/this/'),
                },
                arr: [
                    '/remove/this/but/not/this/first/',
                    new Error('/remove/this/but/not/this/second/'),
                ],
            },
        };

        const pattern = '/remove/this/';

        const result = removeString({ source, pattern });

        expect(result).toMatchSnapshot();
    });
});

describe('normalizeRootPath', () => {
    const cwd = process.cwd();

    afterEach(() => {
        process.chdir(cwd);
    });

    it('removes rootPath', () => {
        const dir = path.resolve(__dirname, '__sandbox__/');
        process.chdir(dir);

        const source = {
            str: path.resolve(dir, 'file.js'),
        };
        const result = normalizeRootPath(source);

        expect(result).toMatchSnapshot();
    });
});
