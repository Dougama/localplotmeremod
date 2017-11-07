(function() {
	let Router = {
	  routes: [],
	  getHash: function() {
	    return this.clearSlashes(window.location.hash.slice(1));

	  },
	  clearSlashes: function(path) {
	    return path.toString().replace(/\/$/, '').replace(/^\//, '');
	  },
	  on: function(request, handler) {
	    if (typeof request === 'function') {
	      handler = request;
	      request = '';
	    }
	    this.routes.push({request: request, handler: handler});
	    return this;
	  },
	  check: function(hash) {
	    let fragment = hash || this.getHash();
	    for (let i = 0; i < this.routes.length; i++) {
	      let match = fragment.match(this.routes[i].request);
	      if (match) {
	        match.shift();
	        this.routes[i].handler.apply({}, match);
	        return this;
	      }
	    }
	    return this;
	  },
	  navigate: function(path) {
	    path = path ? path : '/';
	    window.location.hash =  path;
	    return this;
	  }
	}

	const inner = document.getElementById('inner'); 
	const varListElement = document.getElementById('vars-list');
	const varTemplate = varData => {
		const li = document.createElement('li');
		li.dataset.varId = varData.number;
		li.className = 'varsList-item';
		li.innerHTML = `
			<a class="varsList-item-link" href="#/variable/${varData.number}">
				<span class="varsList-item-value" data-var-value>${varData.value.toFixed(2)}</span></span>${varData.unit}</span>
				<h3 class="varsList-item-name">${varData.name}</h3>
			</a>
		`;
		return li;
	};
	const url = 'fakedata.json';

	let DOMLoaded = false;
	let dataLoaded = false;
	let innerOpen = false;

	let db = {};
	let selected = false;

	function writeVars(data) {
		data.forEach((variable, i) => {
			variable.number = i;
			varListElement.append(varTemplate(variable));
		});
	}

	function updateVars(data) {
		data.forEach((variable, i)=> {
			var element = document.querySelector(`[data-var-id="${i}"]`);
			var valueElement = element.querySelector(`[data-var-value]`);
			valueElement.innerHTML = variable.value.toFixed(2);
		});
	}

	function readAndWriteData() {
		console.log('fetching...');
		fetch(url)
			.then(response => response.json())
			.then(json => {
				db = json;
				if (DOMLoaded && dataLoaded) {
					updateVars(json);
					if (innerOpen) updateChart(json);
				} else {
					Router.check();
					writeVars(json);
					dataLoaded = true;
				}
			});
	}

	const innerTitleElement = document.getElementById('inner-title');
	const ctx = document.getElementById('chart');
	const chartDefaults = {
		type: 'line',
		data: {
			labels: [],
			datasets: [{
				label: 'Historial',
				data: [],
				backgroundColor: ['rgba(255, 99, 132, 0.2)'],
				borderColor: ['rgba(255,99,132,1)'],
				borderWidth: 1
			}]
		}

	}
	let chart = new Chart(ctx, chartDefaults);

	const updateChart = obj => {
		chart.data.labels.push(getTimeLabel());
		chart.data.datasets[0].data.push(obj[selected].value)

		chart.update({duration: 0});
	}

	function openInner() {
		let varData = db.find((dbItem, i) => i === selected);

		if (!varData) return;

		innerTitleElement.innerHTML = varData.name;
		inner.classList.add('innerPage-open');
	}

	function closeInner() {
		selected = false;
		innerOpen = false;
		innerTitleElement.innerHTML = '';
		inner.classList.remove('innerPage-open');

		chart.data.labels = [];
		chart.data.datasets[0].data = [];
		chart.update();
	}


	const getTimeLabel = () => {
		const now = new Date();
		return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
	}

	Router
		.on(/variable\/(.*)/, function() {
			console.log('inner');
			innerOpen = true;
			selected = Number(arguments[0]);
			openInner();
		})
		.on(function() {
			innerOpen = false;
			selected = false;
			closeInner();
		})

	document.addEventListener('DOMContentLoaded', event => {
		DOMLoaded = true;
		readAndWriteData();
		setInterval(readAndWriteData, 3000);
	});

	window.addEventListener('hashchange', function() {
	  Router.check();
	});
})();
