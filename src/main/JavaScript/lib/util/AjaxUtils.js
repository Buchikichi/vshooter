class AjaxUtils {
	static fetch(input, data, headers = {}) {
		if (typeof fetch === 'function') {
			// GlobalFetch.fetch()が存在する場合
//console.log('AjaxUtils.fetch:' + input);
			return fetch(input, {
				method: 'post',
				headers: headers,
				body: data,
				credentials: 'include',
			});
		}
//console.log('AjaxUtils.promise:' + input);
		return new Promise((resolve, reject)=> {
			let client = new XMLHttpRequest();

			client.open('post', input);
			client.withCredentials = true;
			client.responseType= 'blob';
			client.addEventListener('loadend', response => {
				if (200 <= client.status && client.status < 300) {
					let contentType = client.getResponseHeader('Content-Type');
					let blob = new Blob([client.response], {type: contentType});

					resolve({blob: ()=>blob});
					return;
				}
				reject(client);
			});
			Object.keys(headers).forEach(key => {
				client.setRequestHeader(key, headers[key]);
			});
			client.send(data);
		});
	}

	static post(input, data, headers = {}) {
		return AjaxUtils.fetch(input, data);
	}

	static postJSON(input, data) {
		let headers = {'Content-Type':'application/json'};
		let csrfHeader = document.querySelector('[name="_csrf_header"]');

		if (csrfHeader) {
			let key = csrfHeader.getAttribute('content');
			let csrfToken = document.querySelector('[name="_csrf"]').getAttribute('content');

			headers[key] = csrfToken;
		}
		return AjaxUtils.fetch(input, data, headers);
	}
}
