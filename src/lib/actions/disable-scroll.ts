/**
 * @action disableScroll
 *
 * Svelte action that disables page scrolling by applying fixed positioning to
 * the body while preserving the current page offset.
 *
 * Locks are shared per document. Nested modals and drawers capture the page
 * position once and restore it only after the final overlay closes.
 *
 * Reactive: update the boolean parameter to toggle the lock without remounting.
 *
 * @param node - An element in the document whose page should be locked.
 * @param enabled - Whether to apply the lock immediately. Default: true.
 */

type ScrollLockSnapshot = {
	scrollX: number;
	scrollY: number;
	bodyPosition: string;
	bodyWidth: string;
	bodyTop: string;
	bodyLeft: string;
	rootOverflowY: string;
	rootScrollBehavior: string;
};

type ScrollLockState = {
	count: number;
	snapshot: ScrollLockSnapshot;
};

type PendingBehaviorRestore = {
	behavior: string;
	cancel: () => void;
};

const activeLocks = new WeakMap<Document, ScrollLockState>();
const pendingBehaviorRestores = new WeakMap<Document, PendingBehaviorRestore>();

function cancelPendingBehaviorRestore(doc: Document) {
	const pending = pendingBehaviorRestores.get(doc);
	if (!pending) return;

	pending.cancel();
	doc.documentElement.style.scrollBehavior = pending.behavior;
	pendingBehaviorRestores.delete(doc);
}

function acquireScrollLock(doc: Document) {
	const view = doc.defaultView;
	if (!view) return;

	const existing = activeLocks.get(doc);
	if (existing) {
		existing.count += 1;
		return;
	}

	cancelPendingBehaviorRestore(doc);

	const body = doc.body;
	const root = doc.documentElement;
	const snapshot: ScrollLockSnapshot = {
		scrollX: view.scrollX,
		scrollY: view.scrollY,
		bodyPosition: body.style.position,
		bodyWidth: body.style.width,
		bodyTop: body.style.top,
		bodyLeft: body.style.left,
		rootOverflowY: root.style.overflowY,
		rootScrollBehavior: root.style.scrollBehavior
	};

	activeLocks.set(doc, { count: 1, snapshot });

	body.style.top = `-${snapshot.scrollY}px`;
	body.style.left = `-${snapshot.scrollX}px`;
	if (root.scrollHeight > root.clientHeight) {
		root.style.overflowY = 'scroll';
	}
	body.style.position = 'fixed';
	body.style.width = '100%';
}

function releaseScrollLock(doc: Document) {
	const view = doc.defaultView;
	const state = activeLocks.get(doc);
	if (!view || !state) return;

	state.count -= 1;
	if (state.count > 0) return;

	activeLocks.delete(doc);

	const body = doc.body;
	const root = doc.documentElement;
	const { snapshot } = state;

	body.style.position = snapshot.bodyPosition;
	body.style.width = snapshot.bodyWidth;
	body.style.top = snapshot.bodyTop;
	body.style.left = snapshot.bodyLeft;
	root.style.overflowY = snapshot.rootOverflowY;
	root.style.scrollBehavior = 'auto';
	view.scrollTo(snapshot.scrollX, snapshot.scrollY);

	// Keep restoration non-animated for the frame in which body positioning is
	// removed. If another overlay opens in that frame, cancel this callback and
	// restore the original value before taking the new snapshot.
	const pending: PendingBehaviorRestore = {
		behavior: snapshot.rootScrollBehavior,
		cancel: () => {}
	};
	const restore = () => {
		if (pendingBehaviorRestores.get(doc) !== pending) return;
		if (!activeLocks.has(doc)) root.style.scrollBehavior = pending.behavior;
		pendingBehaviorRestores.delete(doc);
	};

	if (view.requestAnimationFrame) {
		const frame = view.requestAnimationFrame(restore);
		pending.cancel = () => view.cancelAnimationFrame(frame);
	} else {
		const timer = view.setTimeout(restore, 0);
		pending.cancel = () => view.clearTimeout(timer);
	}
	pendingBehaviorRestores.set(doc, pending);
}

export function disableScroll(node: HTMLElement, enabled = true) {
	const doc = node.ownerDocument;
	let locked = false;

	function setLocked(next: boolean) {
		if (next === locked) return;
		locked = next;
		if (locked) acquireScrollLock(doc);
		else releaseScrollLock(doc);
	}

	setLocked(enabled);

	return {
		update(newValue: boolean) {
			setLocked(newValue);
		},
		destroy() {
			setLocked(false);
		}
	};
}
