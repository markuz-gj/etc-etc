{Transform} = require "readable-stream" 

chai = require "chai"
sinon = require "sinon"
chai.use require "sinon-chai"

# once = require "lodash.once"

expect = chai.expect
chai.config.showDiff = no


module.exports = 
  fixture: require './fixture'

  test: (fixture = module.exports.fixture) ->
    {bufferMode, objectMode, Deferred} = fixture

    describe "exported value:", ->
      it 'must be a function', ->
        expect(each).to.be.an.instanceof Function

      it "must have obj property", ->
        expect(each).to.have.property "obj"
        expect(each.obj).to.be.an.instanceof Function

      it "must have buf property", ->
        expect(each).to.have.property "buf"
        expect(each.buf).to.be.an.instanceof Function

      it "must have factory property", ->
        expect(each).to.have.property "factory"
        expect(each.factory).to.be.an.instanceof Function

    describe "stream contex:", ->
      it "must have only `chunk`, `encoding` and `next` property on the stream", ->
        st = each -> 
          expect(@).to.have.property "chunk"
          expect(@).to.have.property "encoding"
          expect(@).to.have.property "next"
        st.write('')

      # it "must have a `this._each` property on stream ctx and not as own property", ->
      #   transform = ->
      #     expect(@).to.have.property "_each"
      #     expect(@).to.not.have.ownProperty "_each"

      #   st = each transform
      #   st.write ''

      # it "must have `this._each` function equal the given transform", ->
      #   transform = ->
      #     expect(@_each.toString()).to.equal transform.toString()

      #   st = each  transform
      #   st.write ''

      it "must have `this._encoding` being the rigth encoding", ->
        stA = each -> expect(@encoding).to.equal 'buffer'
        stB = each.obj -> expect(@encoding).to.equal 'utf8'

        stA.write ''
        stB.write ''

    for mode in [bufferMode, objectMode]
      do (mode) ->
        describe mode.desc, ->
          beforeEach mode.before each
          afterEach mode.after

          it "must return an instanceof Transform", (done) ->
            @streamsArray.map (stream, i) =>
              expect(stream).to.be.an.instanceof Transform
              done() if i is @streamsArray.length - 1

          it "must return a noop stream if called without arguments", (done) ->
            @noop.pipe @thr (c,e,n) =>
              expect(c).to.be.equal @data1
              done()

            @noop.write @data1

          it "must pass data through stream unchanged", (done) ->
            cache = []
            defer = new Deferred()

            defer.then =>
              cache.map (spy, i) =>
                expect(spy).to.have.been.calledWith @data1
                expect(spy).to.have.been.calledOnce
                done() if i is cache.length - 1
            .catch done

            @streamsArray.map (stream, i) =>
              stream.write @data1
              cache.push stream.spy
              defer.resolve() if i is @streamsArray.length - 1

          it "must be able to re-use the same stream multiple times", (done) ->
            cache = []
            defer = new Deferred()

            defer.then =>
              cache.map (v, i) =>
                expect(v.spy).to.have.been.calledWith v.data
                expect(v.spy).to.have.callCount @dataArray.length
                done() if i is cache.length - 1
            .catch done

            @streamsArray.map (stream, i) =>
              @dataArray.map (data, j) =>
                stream.write data
                cache.push {spy: stream.spy, data: data}
                defer.resolve() if i is @streamsArray.length - 1  and j is @dataArray.length - 1

          it "must pass data down stream multiple times", (done) ->
            cache = []
            lastSpy = @streamsArray[-1..-1][0].spy
            defer = new Deferred()

            defer.then =>
              expect(lastSpy).to.have.callCount @dataArray.length
              @dataArray.map (data, i) =>
                expect(lastSpy).to.have.been.calledWith data
                done() if i is @dataArray.length - 1
            .catch done

            @noop.pipe @streamsArray[0]
            @streamsArray.map (stream, i) =>
              if i is @streamsArray.length - 1
                return @dataArray.map (data, j) =>
                  @noop.write data
                  defer.resolve() if j is @dataArray.length - 1

              stream.pipe @streamsArray[i + 1]

          it "must have the this stuff", (done) ->
            cache = []
            defer = new Deferred()

            defer.then =>
              cache.map (v, i) =>
                expect(v.spy).to.have.been.calledWith v.data
                expect(v.spy).to.have.callCount @dataArray.length
                done() if i is cache.length - 1
            .catch done

            @streamsArray.map (stream, i) =>
              @dataArray.map (data, j) =>
                stream.write data
                cache.push {spy: stream.spy, data: data}
                defer.resolve() if i is @streamsArray.length - 1  and j is @dataArray.length - 1



