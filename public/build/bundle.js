
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Login.svelte generated by Svelte v3.59.2 */

    const file$7 = "src\\Login.svelte";

    function create_fragment$7(ctx) {
    	let div2;
    	let h2;
    	let t1;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let button0;
    	let t9;
    	let br0;
    	let br1;
    	let t10;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Login";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Usuário:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Senha:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button0 = element("button");
    			button0.textContent = "Entrar";
    			t9 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t10 = space();
    			button1 = element("button");
    			button1.textContent = "Não tem cadastro? Clique aqui";
    			attr_dev(h2, "class", "svelte-o26thg");
    			add_location(h2, file$7, 22, 8, 425);
    			attr_dev(label0, "for", "usuario");
    			attr_dev(label0, "class", "svelte-o26thg");
    			add_location(label0, file$7, 24, 12, 487);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "usuario");
    			attr_dev(input0, "placeholder", "Digite seu usuário");
    			attr_dev(input0, "class", "svelte-o26thg");
    			add_location(input0, file$7, 25, 12, 538);
    			attr_dev(div0, "class", "form-field svelte-o26thg");
    			add_location(div0, file$7, 23, 8, 449);
    			attr_dev(label1, "for", "senha");
    			attr_dev(label1, "class", "svelte-o26thg");
    			add_location(label1, file$7, 28, 12, 690);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "id", "senha");
    			attr_dev(input1, "placeholder", "Digite sua senha");
    			attr_dev(input1, "class", "svelte-o26thg");
    			add_location(input1, file$7, 29, 12, 737);
    			attr_dev(div1, "class", "form-field svelte-o26thg");
    			add_location(div1, file$7, 27, 8, 652);
    			attr_dev(button0, "class", "svelte-o26thg");
    			add_location(button0, file$7, 31, 8, 849);
    			add_location(br0, file$7, 32, 8, 904);
    			add_location(br1, file$7, 32, 12, 908);
    			attr_dev(button1, "class", "svelte-o26thg");
    			add_location(button1, file$7, 33, 8, 922);
    			attr_dev(div2, "class", "login-form svelte-o26thg");
    			add_location(div2, file$7, 21, 4, 391);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*usuario*/ ctx[1]);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*senha*/ ctx[2]);
    			append_dev(div2, t7);
    			append_dev(div2, button0);
    			append_dev(div2, t9);
    			append_dev(div2, br0);
    			append_dev(div2, br1);
    			append_dev(div2, t10);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button0, "click", /*fazerLogin*/ ctx[3], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[6], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*usuario*/ 2 && input0.value !== /*usuario*/ ctx[1]) {
    				set_input_value(input0, /*usuario*/ ctx[1]);
    			}

    			if (dirty & /*senha*/ 4 && input1.value !== /*senha*/ ctx[2]) {
    				set_input_value(input1, /*senha*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let { onNavigate } = $$props;
    	let usuario = '';
    	let senha = '';

    	async function fazerLogin() {
    		if (!usuario || !senha) {
    			alert("Todos os campos devem ser preenchidos!");
    			return;
    		}

    		if (usuario === "admin" && senha === "12345") {
    			onNavigate('Cursos');
    		} else {
    			alert("Usuário ou senha inválidos!");
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (onNavigate === undefined && !('onNavigate' in $$props || $$self.$$.bound[$$self.$$.props['onNavigate']])) {
    			console.warn("<Login> was created without expected prop 'onNavigate'");
    		}
    	});

    	const writable_props = ['onNavigate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		usuario = this.value;
    		$$invalidate(1, usuario);
    	}

    	function input1_input_handler() {
    		senha = this.value;
    		$$invalidate(2, senha);
    	}

    	const click_handler = () => onNavigate('Cadastro');

    	$$self.$$set = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(0, onNavigate = $$props.onNavigate);
    	};

    	$$self.$capture_state = () => ({ onNavigate, usuario, senha, fazerLogin });

    	$$self.$inject_state = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(0, onNavigate = $$props.onNavigate);
    		if ('usuario' in $$props) $$invalidate(1, usuario = $$props.usuario);
    		if ('senha' in $$props) $$invalidate(2, senha = $$props.senha);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		onNavigate,
    		usuario,
    		senha,
    		fazerLogin,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { onNavigate: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get onNavigate() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNavigate(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Cadastro.svelte generated by Svelte v3.59.2 */

    const file$6 = "src\\Cadastro.svelte";

    function create_fragment$6(ctx) {
    	let div4;
    	let h2;
    	let t1;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let input2;
    	let t10;
    	let div3;
    	let label3;
    	let t12;
    	let input3;
    	let t13;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Cadastrar";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Nome de usuário:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Senha:";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Confirmar Senha:";
    			t12 = space();
    			input3 = element("input");
    			t13 = space();
    			button = element("button");
    			button.textContent = "Cadastrar";
    			attr_dev(h2, "class", "svelte-o26thg");
    			add_location(h2, file$6, 28, 8, 592);
    			attr_dev(label0, "for", "usuario");
    			attr_dev(label0, "class", "svelte-o26thg");
    			add_location(label0, file$6, 30, 12, 658);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "usuario");
    			attr_dev(input0, "placeholder", "Digite um nome de usuário");
    			attr_dev(input0, "class", "svelte-o26thg");
    			add_location(input0, file$6, 31, 12, 717);
    			attr_dev(div0, "class", "form-field svelte-o26thg");
    			add_location(div0, file$6, 29, 8, 620);
    			attr_dev(label1, "for", "email");
    			attr_dev(label1, "class", "svelte-o26thg");
    			add_location(label1, file$6, 34, 12, 876);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "usuario");
    			attr_dev(input1, "placeholder", "Digite seu email");
    			attr_dev(input1, "class", "svelte-o26thg");
    			add_location(input1, file$6, 35, 12, 923);
    			attr_dev(div1, "class", "form-field svelte-o26thg");
    			add_location(div1, file$6, 33, 8, 838);
    			attr_dev(label2, "for", "senha");
    			attr_dev(label2, "class", "svelte-o26thg");
    			add_location(label2, file$6, 38, 12, 1071);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "id", "senha");
    			attr_dev(input2, "placeholder", "Digite sua senha");
    			attr_dev(input2, "class", "svelte-o26thg");
    			add_location(input2, file$6, 39, 12, 1118);
    			attr_dev(div2, "class", "form-field svelte-o26thg");
    			add_location(div2, file$6, 37, 8, 1033);
    			attr_dev(label3, "for", "senhac");
    			attr_dev(label3, "class", "svelte-o26thg");
    			add_location(label3, file$6, 42, 12, 1268);
    			attr_dev(input3, "type", "password");
    			attr_dev(input3, "id", "senha");
    			attr_dev(input3, "placeholder", "Confirme sua senha");
    			attr_dev(input3, "class", "svelte-o26thg");
    			add_location(input3, file$6, 43, 12, 1326);
    			attr_dev(div3, "class", "form-field svelte-o26thg");
    			add_location(div3, file$6, 41, 8, 1230);
    			attr_dev(button, "class", "svelte-o26thg");
    			add_location(button, file$6, 45, 8, 1449);
    			attr_dev(div4, "class", "login-form svelte-o26thg");
    			add_location(div4, file$6, 27, 4, 558);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			append_dev(div4, t1);
    			append_dev(div4, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*usuario*/ ctx[0]);
    			append_dev(div4, t4);
    			append_dev(div4, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*email*/ ctx[1]);
    			append_dev(div4, t7);
    			append_dev(div4, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			set_input_value(input2, /*senha*/ ctx[2]);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t12);
    			append_dev(div3, input3);
    			set_input_value(input3, /*confirmarSenha*/ ctx[3]);
    			append_dev(div4, t13);
    			append_dev(div4, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[9]),
    					listen_dev(button, "click", /*fazerCadastro*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*usuario*/ 1 && input0.value !== /*usuario*/ ctx[0]) {
    				set_input_value(input0, /*usuario*/ ctx[0]);
    			}

    			if (dirty & /*email*/ 2 && input1.value !== /*email*/ ctx[1]) {
    				set_input_value(input1, /*email*/ ctx[1]);
    			}

    			if (dirty & /*senha*/ 4 && input2.value !== /*senha*/ ctx[2]) {
    				set_input_value(input2, /*senha*/ ctx[2]);
    			}

    			if (dirty & /*confirmarSenha*/ 8 && input3.value !== /*confirmarSenha*/ ctx[3]) {
    				set_input_value(input3, /*confirmarSenha*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cadastro', slots, []);
    	let { onNavigate } = $$props;
    	let usuario = '';
    	let email = '';
    	let senha = '';
    	let confirmarSenha = '';

    	async function fazerCadastro() {
    		if (!usuario || !email || !senha || !confirmarSenha) {
    			alert("Todos os campos devem ser preenchidos!");
    			return;
    		}

    		if (senha !== confirmarSenha) {
    			alert("As senhas não coincidem!");
    			return;
    		}

    		alert("Usuário cadastrado com sucesso");
    		onNavigate('Cursos');
    	}

    	$$self.$$.on_mount.push(function () {
    		if (onNavigate === undefined && !('onNavigate' in $$props || $$self.$$.bound[$$self.$$.props['onNavigate']])) {
    			console.warn("<Cadastro> was created without expected prop 'onNavigate'");
    		}
    	});

    	const writable_props = ['onNavigate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cadastro> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		usuario = this.value;
    		$$invalidate(0, usuario);
    	}

    	function input1_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	function input2_input_handler() {
    		senha = this.value;
    		$$invalidate(2, senha);
    	}

    	function input3_input_handler() {
    		confirmarSenha = this.value;
    		$$invalidate(3, confirmarSenha);
    	}

    	$$self.$$set = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(5, onNavigate = $$props.onNavigate);
    	};

    	$$self.$capture_state = () => ({
    		onNavigate,
    		usuario,
    		email,
    		senha,
    		confirmarSenha,
    		fazerCadastro
    	});

    	$$self.$inject_state = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(5, onNavigate = $$props.onNavigate);
    		if ('usuario' in $$props) $$invalidate(0, usuario = $$props.usuario);
    		if ('email' in $$props) $$invalidate(1, email = $$props.email);
    		if ('senha' in $$props) $$invalidate(2, senha = $$props.senha);
    		if ('confirmarSenha' in $$props) $$invalidate(3, confirmarSenha = $$props.confirmarSenha);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		usuario,
    		email,
    		senha,
    		confirmarSenha,
    		fazerCadastro,
    		onNavigate,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	];
    }

    class Cadastro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { onNavigate: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cadastro",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get onNavigate() {
    		throw new Error("<Cadastro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNavigate(value) {
    		throw new Error("<Cadastro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Cursos.svelte generated by Svelte v3.59.2 */

    const file$5 = "src\\Cursos.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (78:4) {#each cursosDisponiveis as curso (curso.id)}
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let h2;
    	let t0_value = /*curso*/ ctx[3].nome + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let p;
    	let t3;
    	let t4_value = /*curso*/ ctx[3].instrutor + "";
    	let t4;
    	let t5;
    	let button;
    	let t7;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			p = element("p");
    			t3 = text("Instrutor: ");
    			t4 = text(t4_value);
    			t5 = space();
    			button = element("button");
    			button.textContent = "Inscrever-se";
    			t7 = space();
    			attr_dev(h2, "class", "svelte-15i08fp");
    			add_location(h2, file$5, 79, 12, 2995);
    			if (!src_url_equal(img.src, img_src_value = /*curso*/ ctx[3].imagem)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "imagem do curso");
    			attr_dev(img, "class", "svelte-15i08fp");
    			add_location(img, file$5, 80, 12, 3030);
    			attr_dev(p, "class", "svelte-15i08fp");
    			add_location(p, file$5, 81, 12, 3092);
    			attr_dev(button, "class", "svelte-15i08fp");
    			add_location(button, file$5, 82, 12, 3141);
    			attr_dev(div, "class", "curso-card svelte-15i08fp");
    			add_location(div, file$5, 78, 8, 2957);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, img);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(div, t5);
    			append_dev(div, button);
    			append_dev(div, t7);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(78:4) {#each cursosDisponiveis as curso (curso.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*cursosDisponiveis*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*curso*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Cursos Disponíveis";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-15i08fp");
    			add_location(h1, file$5, 74, 0, 2833);
    			attr_dev(div, "class", "cursos-disponiveis svelte-15i08fp");
    			add_location(div, file$5, 76, 0, 2864);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*onNavigate, cursosDisponiveis*/ 3) {
    				each_value = /*cursosDisponiveis*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$1, null, get_each_context$1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cursos', slots, []);
    	let { onNavigate } = $$props;

    	let cursosDisponiveis = [
    		{
    			id: 1,
    			nome: "Estrutura de Dados com C",
    			instrutor: "Camelo Lelis",
    			imagem: "https://arquivo.devmedia.com.br/marketing/img/guia-introducao-a-programacao-37404.png"
    		},
    		{
    			id: 2,
    			nome: "Web Design Avançado",
    			instrutor: "Maria Luisa",
    			imagem: "https://uniateneu.edu.br/wp-content/uploads/2021/10/woman-designing-website-graphic.webp"
    		},
    		{
    			id: 3,
    			nome: "Marketing Digital",
    			instrutor: "Heitor Borba",
    			imagem: "https://i0.wp.com/www.webprecious.com/wp-content/uploads/2023/03/Become-a-Web-Designer.jpg?resize=750%2C410&ssl=1"
    		},
    		{
    			id: 4,
    			nome: "Python para Iniciantes",
    			instrutor: "Mateus Alves",
    			imagem: "https://t.ctcdn.com.br/o1B2PCtA5iQc2ofKn7FrcWiP9t4=/4032x2268/smart/i569772.jpeg"
    		},
    		{
    			id: 5,
    			nome: "UX/UI Design Fundamentals",
    			instrutor: "Igor Marinho",
    			imagem: "https://assets.telegraphindia.com/telegraph/2022/Sep/1663430911_untitled.jpg"
    		},
    		{
    			id: 6,
    			nome: "JavaScript Moderno",
    			instrutor: "Dogonski33",
    			imagem: "https://miro.medium.com/v2/resize:fit:1200/0*FXxXHe5eVfn1T4Rf.png"
    		},
    		{
    			id: 7,
    			nome: "Recriando o Instagram com Kotlin",
    			instrutor: "Jefferson Kot",
    			imagem: "https://blog.geekhunter.com.br/wp-content/uploads/2021/02/Kotlin-e1612441852104.jpg"
    		},
    		{
    			id: 8,
    			nome: "Estratégias de SEO",
    			instrutor: "Gabriela Gabri",
    			imagem: "https://99designs-blog.imgix.net/blog/wp-content/uploads/2019/05/DIFFERENT_TYPES_of_WEBSITES_jpg_CIaku32S.jpg?auto=format&q=60&fit=max&w=930"
    		},
    		{
    			id: 9,
    			nome: "Banco de Dados para Web",
    			instrutor: "Gustavo Machado",
    			imagem: "https://cdn.cl9.com.br/wp-content/uploads/2020/06/banco-de-dados-como-servico-o-que-e-e-quais-os-beneficios-p10drsmzu8okc1cww9o3ypie6ymj3uxj7xqj7reqq0.jpg"
    		},
    		{
    			id: 10,
    			nome: "Machine Learning com Python",
    			instrutor: "David Bow",
    			imagem: "https://solvimm.com/wp-content/uploads/2019/11/Destacada_Qual_tipo_de_Banco_de_Dados_utilizar.png"
    		},
    		{
    			id: 11,
    			nome: "Criando o melhor site com Svelte",
    			instrutor: "NathanRdS",
    			imagem: "https://miro.medium.com/max/2880/1*oHCbzzQSSmDF9icaxCk3iw.jpeg"
    		}
    	];

    	$$self.$$.on_mount.push(function () {
    		if (onNavigate === undefined && !('onNavigate' in $$props || $$self.$$.bound[$$self.$$.props['onNavigate']])) {
    			console.warn("<Cursos> was created without expected prop 'onNavigate'");
    		}
    	});

    	const writable_props = ['onNavigate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cursos> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onNavigate('Detalhes');

    	$$self.$$set = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(0, onNavigate = $$props.onNavigate);
    	};

    	$$self.$capture_state = () => ({ onNavigate, cursosDisponiveis });

    	$$self.$inject_state = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(0, onNavigate = $$props.onNavigate);
    		if ('cursosDisponiveis' in $$props) $$invalidate(1, cursosDisponiveis = $$props.cursosDisponiveis);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onNavigate, cursosDisponiveis, click_handler];
    }

    class Cursos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { onNavigate: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cursos",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get onNavigate() {
    		throw new Error("<Cursos>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNavigate(value) {
    		throw new Error("<Cursos>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Perfil.svelte generated by Svelte v3.59.2 */

    const file$4 = "src\\Perfil.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (27:4) {#each usuario.cursos as curso}
    function create_each_block(ctx) {
    	let div;
    	let t0_value = /*curso*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let center;
    	let button;
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			center = element("center");
    			button = element("button");
    			button.textContent = "Mais informações";
    			t4 = space();
    			add_location(br, file$4, 29, 12, 817);
    			attr_dev(button, "class", "svelte-65g1fa");
    			add_location(button, file$4, 31, 16, 861);
    			add_location(center, file$4, 30, 12, 835);
    			attr_dev(div, "class", "curso-item svelte-65g1fa");
    			add_location(div, file$4, 27, 8, 758);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, br);
    			append_dev(div, t2);
    			append_dev(div, center);
    			append_dev(center, button);
    			append_dev(div, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(27:4) {#each usuario.cursos as curso}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div0;
    	let h1;
    	let t0_value = /*usuario*/ ctx[1].nome + "";
    	let t0;
    	let br0;
    	let t1;
    	let h20;
    	let t2_value = /*usuario*/ ctx[1].user + "";
    	let t2;
    	let br1;
    	let t3;
    	let h21;
    	let t4;
    	let t5_value = /*usuario*/ ctx[1].xp + "";
    	let t5;
    	let br2;
    	let br3;
    	let t6;
    	let h3;
    	let h4;
    	let t9;
    	let div1;
    	let h22;
    	let t11;
    	let each_value = /*usuario*/ ctx[1].cursos;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			br0 = element("br");
    			t1 = space();
    			h20 = element("h2");
    			t2 = text(t2_value);
    			br1 = element("br");
    			t3 = space();
    			h21 = element("h2");
    			t4 = text("XP:");
    			t5 = text(t5_value);
    			br2 = element("br");
    			br3 = element("br");
    			t6 = space();
    			h3 = element("h3");
    			h3.textContent = "Biografia:";
    			h4 = element("h4");
    			h4.textContent = `${/*usuario*/ ctx[1].biografia}`;
    			t9 = space();
    			div1 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Cursos terminados:";
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(br0, file$4, 18, 22, 500);
    			add_location(h1, file$4, 18, 4, 482);
    			add_location(br1, file$4, 19, 22, 533);
    			add_location(h20, file$4, 19, 4, 515);
    			add_location(br2, file$4, 20, 23, 567);
    			add_location(br3, file$4, 20, 27, 571);
    			add_location(h21, file$4, 20, 4, 548);
    			add_location(h3, file$4, 21, 4, 586);
    			add_location(h4, file$4, 21, 23, 605);
    			attr_dev(div0, "class", "informacoes-usuario svelte-65g1fa");
    			add_location(div0, file$4, 17, 0, 443);
    			add_location(h22, file$4, 25, 4, 684);
    			attr_dev(div1, "class", "informacoes-usuario svelte-65g1fa");
    			add_location(div1, file$4, 24, 0, 645);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, br0);
    			append_dev(div0, t1);
    			append_dev(div0, h20);
    			append_dev(h20, t2);
    			append_dev(h20, br1);
    			append_dev(div0, t3);
    			append_dev(div0, h21);
    			append_dev(h21, t4);
    			append_dev(h21, t5);
    			append_dev(h21, br2);
    			append_dev(h21, br3);
    			append_dev(div0, t6);
    			append_dev(div0, h3);
    			append_dev(div0, h4);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h22);
    			append_dev(div1, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*onNavigate, usuario*/ 3) {
    				each_value = /*usuario*/ ctx[1].cursos;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Perfil', slots, []);
    	let { onNavigate } = $$props;

    	let usuario = {
    		id: 1,
    		nome: "Nathan Rodrigues dos Santos",
    		user: "NahNathan",
    		biografia: "Vou escrever alguma coisa aqui eventualmente, eu juro.",
    		xp: 1000,
    		cursos: [
    			"Recriando o Instagram com Kotlin",
    			"Estruturas de Dados com C",
    			"Criando o melhor site com Svelte"
    		]
    	};

    	$$self.$$.on_mount.push(function () {
    		if (onNavigate === undefined && !('onNavigate' in $$props || $$self.$$.bound[$$self.$$.props['onNavigate']])) {
    			console.warn("<Perfil> was created without expected prop 'onNavigate'");
    		}
    	});

    	const writable_props = ['onNavigate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Perfil> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onNavigate('Detalhes');

    	$$self.$$set = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(0, onNavigate = $$props.onNavigate);
    	};

    	$$self.$capture_state = () => ({ onNavigate, usuario });

    	$$self.$inject_state = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(0, onNavigate = $$props.onNavigate);
    		if ('usuario' in $$props) $$invalidate(1, usuario = $$props.usuario);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onNavigate, usuario, click_handler];
    }

    class Perfil extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { onNavigate: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Perfil",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get onNavigate() {
    		throw new Error("<Perfil>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNavigate(value) {
    		throw new Error("<Perfil>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Configurações.svelte generated by Svelte v3.59.2 */

    const file$3 = "src\\Configurações.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let br0;
    	let br1;
    	let br2;
    	let t1;
    	let button0;
    	let br3;
    	let t3;
    	let button1;
    	let br4;
    	let t5;
    	let button2;
    	let br5;
    	let t7;
    	let button3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text("Configurações");
    			br0 = element("br");
    			br1 = element("br");
    			br2 = element("br");
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Alterar tal coisa";
    			br3 = element("br");
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Alterar outra coisa";
    			br4 = element("br");
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Alterar mais outra coisa";
    			br5 = element("br");
    			t7 = space();
    			button3 = element("button");
    			button3.textContent = "Alterar ainda outra coisa";
    			add_location(br0, file$3, 1, 21, 56);
    			add_location(h1, file$3, 1, 4, 39);
    			add_location(br1, file$3, 1, 30, 65);
    			add_location(br2, file$3, 1, 34, 69);
    			attr_dev(button0, "class", "svelte-6ra26r");
    			add_location(button0, file$3, 2, 4, 79);
    			add_location(br3, file$3, 2, 38, 113);
    			attr_dev(button1, "class", "svelte-6ra26r");
    			add_location(button1, file$3, 3, 4, 123);
    			add_location(br4, file$3, 3, 40, 159);
    			attr_dev(button2, "class", "svelte-6ra26r");
    			add_location(button2, file$3, 4, 4, 169);
    			add_location(br5, file$3, 4, 45, 210);
    			attr_dev(button3, "class", "svelte-6ra26r");
    			add_location(button3, file$3, 5, 4, 220);
    			attr_dev(div, "class", "informacoes-usuario svelte-6ra26r");
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, br0);
    			append_dev(div, br1);
    			append_dev(div, br2);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, br3);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, br4);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, br5);
    			append_dev(div, t7);
    			append_dev(div, button3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ConfigurauC3uA7uC3uB5es', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ConfigurauC3uA7uC3uB5es> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ConfigurauC3uA7uC3uB5es extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfigurauC3uA7uC3uB5es",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Detalhes.svelte generated by Svelte v3.59.2 */

    const file$2 = "src\\Detalhes.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let h4;
    	let t3;
    	let iframe;
    	let iframe_src_value;
    	let t4;
    	let br0;
    	let br1;
    	let br2;
    	let t5;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*curso*/ ctx[1].nome}`;
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = `${/*curso*/ ctx[1].descrição}`;
    			t3 = space();
    			iframe = element("iframe");
    			t4 = space();
    			br0 = element("br");
    			br1 = element("br");
    			br2 = element("br");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Curso Concluído✅";
    			add_location(h1, file$2, 13, 4, 574);
    			add_location(h4, file$2, 14, 4, 601);
    			attr_dev(iframe, "width", "560");
    			attr_dev(iframe, "height", "315");
    			if (!src_url_equal(iframe.src, iframe_src_value = /*curso*/ ctx[1].video)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "YouTube video player");
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file$2, 15, 4, 633);
    			add_location(br0, file$2, 23, 7, 924);
    			add_location(br1, file$2, 23, 11, 928);
    			add_location(br2, file$2, 23, 15, 932);
    			attr_dev(button, "class", "svelte-1c56km1");
    			add_location(button, file$2, 24, 4, 942);
    			attr_dev(div, "class", "informacoes-curso svelte-1c56km1");
    			add_location(div, file$2, 12, 0, 537);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, h4);
    			append_dev(div, t3);
    			append_dev(div, iframe);
    			append_dev(div, t4);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, br2);
    			append_dev(div, t5);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Detalhes', slots, []);
    	let { onNavigate } = $$props;

    	let curso = {
    		id: 1,
    		nome: "Estruturas de Dados com C",
    		descrição: "Neste curso você irá embarcar no incrível mundo das estruturas de dados. Você aprenderá a analisar, adicionar e retirar dados de diversas estruturas como Pilhas, Filas, Listas, Árvores e muito mais. Tudo isso utilizando a incrível linguagem C, consagrada no mercado há mais de 50 anos",
    		video: "https://youtube.com/embed/9GdesxWtOgs?si=yJmg2Leon5g21Abo"
    	};

    	$$self.$$.on_mount.push(function () {
    		if (onNavigate === undefined && !('onNavigate' in $$props || $$self.$$.bound[$$self.$$.props['onNavigate']])) {
    			console.warn("<Detalhes> was created without expected prop 'onNavigate'");
    		}
    	});

    	const writable_props = ['onNavigate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Detalhes> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onNavigate('Perfil');

    	$$self.$$set = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(0, onNavigate = $$props.onNavigate);
    	};

    	$$self.$capture_state = () => ({ onNavigate, curso });

    	$$self.$inject_state = $$props => {
    		if ('onNavigate' in $$props) $$invalidate(0, onNavigate = $$props.onNavigate);
    		if ('curso' in $$props) $$invalidate(1, curso = $$props.curso);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onNavigate, curso, click_handler];
    }

    class Detalhes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { onNavigate: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Detalhes",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get onNavigate() {
    		throw new Error("<Detalhes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNavigate(value) {
    		throw new Error("<Detalhes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Contato.svelte generated by Svelte v3.59.2 */

    const file$1 = "src\\Contato.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let br2;
    	let t2;
    	let a0;
    	let button0;
    	let t4;
    	let a1;
    	let button1;
    	let t6;
    	let a2;
    	let button2;
    	let t8;
    	let h3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text("Entre em contato!");
    			br0 = element("br");
    			t1 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t2 = space();
    			a0 = element("a");
    			button0 = element("button");
    			button0.textContent = "Github";
    			t4 = space();
    			a1 = element("a");
    			button1 = element("button");
    			button1.textContent = "Linkedin";
    			t6 = space();
    			a2 = element("a");
    			button2 = element("button");
    			button2.textContent = "Instagram";
    			t8 = space();
    			h3 = element("h3");
    			h3.textContent = "Feito por Nathan 『RdS』 ☕";
    			add_location(br0, file$1, 1, 25, 60);
    			add_location(h1, file$1, 1, 4, 39);
    			add_location(br1, file$1, 2, 4, 75);
    			add_location(br2, file$1, 2, 8, 79);
    			attr_dev(button0, "class", "svelte-pughpw");
    			add_location(button0, file$1, 5, 8, 140);
    			attr_dev(a0, "href", "https://github.com/NahNathan");
    			attr_dev(a0, "class", "svelte-pughpw");
    			add_location(a0, file$1, 4, 4, 91);
    			attr_dev(button1, "class", "svelte-pughpw");
    			add_location(button1, file$1, 9, 8, 268);
    			attr_dev(a1, "href", "https://www.linkedin.com/in/nathan-rodrigues-dos-santos-422001147/");
    			attr_dev(a1, "class", "svelte-pughpw");
    			add_location(a1, file$1, 8, 4, 181);
    			attr_dev(button2, "class", "svelte-pughpw");
    			add_location(button2, file$1, 13, 8, 371);
    			attr_dev(a2, "href", "https://www.instagram.com/_nathan_rds_/");
    			attr_dev(a2, "class", "svelte-pughpw");
    			add_location(a2, file$1, 12, 4, 311);
    			add_location(h3, file$1, 16, 4, 415);
    			attr_dev(div, "class", "informacoes-usuario svelte-pughpw");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, br0);
    			append_dev(div, t1);
    			append_dev(div, br1);
    			append_dev(div, br2);
    			append_dev(div, t2);
    			append_dev(div, a0);
    			append_dev(a0, button0);
    			append_dev(div, t4);
    			append_dev(div, a1);
    			append_dev(a1, button1);
    			append_dev(div, t6);
    			append_dev(div, a2);
    			append_dev(a2, button2);
    			append_dev(div, t8);
    			append_dev(div, h3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contato', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contato> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contato extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contato",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    // (43:31) 
    function create_if_block_6(ctx) {
    	let contato;
    	let current;
    	contato = new Contato({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(contato.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contato, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contato.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contato.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contato, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(43:31) ",
    		ctx
    	});

    	return block;
    }

    // (41:32) 
    function create_if_block_5(ctx) {
    	let detalhes;
    	let current;

    	detalhes = new Detalhes({
    			props: { onNavigate: /*navigate*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(detalhes.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(detalhes, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(detalhes.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(detalhes.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(detalhes, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(41:32) ",
    		ctx
    	});

    	return block;
    }

    // (39:37) 
    function create_if_block_4(ctx) {
    	let configura_es;
    	let current;
    	configura_es = new ConfigurauC3uA7uC3uB5es({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(configura_es.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(configura_es, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(configura_es.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(configura_es.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(configura_es, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(39:37) ",
    		ctx
    	});

    	return block;
    }

    // (37:30) 
    function create_if_block_3(ctx) {
    	let perfil;
    	let current;

    	perfil = new Perfil({
    			props: { onNavigate: /*navigate*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(perfil.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(perfil, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(perfil.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(perfil.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(perfil, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(37:30) ",
    		ctx
    	});

    	return block;
    }

    // (35:30) 
    function create_if_block_2(ctx) {
    	let cursos;
    	let current;

    	cursos = new Cursos({
    			props: { onNavigate: /*navigate*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cursos.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cursos, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cursos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cursos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cursos, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(35:30) ",
    		ctx
    	});

    	return block;
    }

    // (33:32) 
    function create_if_block_1(ctx) {
    	let cadastro;
    	let current;

    	cadastro = new Cadastro({
    			props: { onNavigate: /*navigate*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cadastro.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cadastro, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cadastro.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cadastro.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cadastro, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(33:32) ",
    		ctx
    	});

    	return block;
    }

    // (31:2) {#if page === "Login"}
    function create_if_block(ctx) {
    	let login;
    	let current;

    	login = new Login({
    			props: { onNavigate: /*navigate*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(31:2) {#if page === \\\"Login\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let nav;
    	let img;
    	let img_src_value;
    	let t0;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let button2;
    	let t6;
    	let button3;
    	let t8;
    	let button4;
    	let t10;
    	let button5;
    	let t12;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[0] === "Login") return 0;
    		if (/*page*/ ctx[0] === "Cadastro") return 1;
    		if (/*page*/ ctx[0] === "Cursos") return 2;
    		if (/*page*/ ctx[0] === "Perfil") return 3;
    		if (/*page*/ ctx[0] === "Configurações") return 4;
    		if (/*page*/ ctx[0] === "Detalhes") return 5;
    		if (/*page*/ ctx[0] === "Contato") return 6;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			nav = element("nav");
    			img = element("img");
    			t0 = space();
    			button0 = element("button");
    			button0.textContent = "Cadastrar";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Login";
    			t4 = space();
    			button2 = element("button");
    			button2.textContent = "Todos os Cursos";
    			t6 = space();
    			button3 = element("button");
    			button3.textContent = "Perfil";
    			t8 = space();
    			button4 = element("button");
    			button4.textContent = "Configurações";
    			t10 = space();
    			button5 = element("button");
    			button5.textContent = "Contato";
    			t12 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			if (!src_url_equal(img.src, img_src_value = ".\\Logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo");
    			attr_dev(img, "class", "svelte-emyydo");
    			add_location(img, file, 20, 2, 425);
    			attr_dev(button0, "class", "svelte-emyydo");
    			add_location(button0, file, 21, 2, 463);
    			attr_dev(button1, "class", "svelte-emyydo");
    			add_location(button1, file, 22, 2, 530);
    			attr_dev(button2, "class", "svelte-emyydo");
    			add_location(button2, file, 23, 2, 590);
    			attr_dev(button3, "class", "svelte-emyydo");
    			add_location(button3, file, 24, 2, 661);
    			attr_dev(button4, "class", "svelte-emyydo");
    			add_location(button4, file, 25, 2, 723);
    			attr_dev(button5, "class", "svelte-emyydo");
    			add_location(button5, file, 26, 2, 799);
    			attr_dev(nav, "class", "svelte-emyydo");
    			add_location(nav, file, 19, 1, 417);
    			attr_dev(main, "class", "svelte-emyydo");
    			add_location(main, file, 29, 1, 871);
    			attr_dev(div, "id", "tudo");
    			attr_dev(div, "class", "svelte-emyydo");
    			add_location(div, file, 18, 0, 400);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, nav);
    			append_dev(nav, img);
    			append_dev(nav, t0);
    			append_dev(nav, button0);
    			append_dev(nav, t2);
    			append_dev(nav, button1);
    			append_dev(nav, t4);
    			append_dev(nav, button2);
    			append_dev(nav, t6);
    			append_dev(nav, button3);
    			append_dev(nav, t8);
    			append_dev(nav, button4);
    			append_dev(nav, t10);
    			append_dev(nav, button5);
    			append_dev(div, t12);
    			append_dev(div, main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[3], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[4], false, false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[5], false, false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[6], false, false, false, false),
    					listen_dev(button5, "click", /*click_handler_5*/ ctx[7], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let page = "Login";
    	console.log(page);

    	function navigate(to) {
    		$$invalidate(0, page = to);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => navigate("Cadastro");
    	const click_handler_1 = () => navigate("Login");
    	const click_handler_2 = () => navigate("Cursos");
    	const click_handler_3 = () => navigate("Perfil");
    	const click_handler_4 = () => navigate("Configurações");
    	const click_handler_5 = () => navigate("Contato");

    	$$self.$capture_state = () => ({
    		page,
    		Login,
    		Cadastro,
    		Cursos,
    		Perfil,
    		Configurações: ConfigurauC3uA7uC3uB5es,
    		Detalhes,
    		Contato,
    		navigate
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		page,
    		navigate,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
