import Reference from './Reference'

export default class LateResolutionReference extends Reference {
    resolve() {
        return this
            .set('resolved', true)
    }

    evaluate(references) {
        let ref = this.get('uri')
        let match = ref.match(/{{[^{}]*}}/)
        let maxResolutions = 20
        let counter = {
            resolutionCount: 0
        }

        let replacer = this._replaceRef(references, counter)

        let previous
        while (
            match &&
            counter.resolutionCount < maxResolutions &&
            ref !== previous
        ) {
            previous = ref
            ref = ref.replace(/({{[^{}]*}})/, replacer)
            match = ref.match(/{{[^{}]*}}/)
        }

        return this.set('value', ref)
    }

    _replaceRef(references, counter) {
        return (match, group) => {
            let value
            let ref
            if (this.get('uri') === '#/x-postman/' + group) {
                /* eslint-disable consistent-this */
                ref = this
                /* eslint-enable consistent-this */
            }
            else {
                ref = references.resolve('#/x-postman/' + group)
            }
            if (ref) {
                value = ref.get('value')
            }
            else {
                value = group
            }
            counter.resolutionCount += 1
            return value
        }
    }

    getDataUri() {
        return null
    }
}