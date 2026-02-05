export class PhotoView {
  render(photo: { id: number; url: string }) {
    return `
      <div class="max-w-md rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 hover:scale-105">
        <img class="w-full h-64 object-cover cursor-pointer" src="${photo.url}" alt="Photo" data-photo-id="${photo.id}" onclick="openModal('${photo.url}')">
        <div class="px-2 py-1 text-center">
          <a href="${photo.url}" download class="text-slate-300 hover:text-blue-700 transition-colors duration-300">
            <i class="fas fa-download"></i>
          </a>
        </div>
      </div>
    `;
  }
}
