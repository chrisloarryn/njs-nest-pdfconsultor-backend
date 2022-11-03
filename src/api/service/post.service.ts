import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { forkJoin, lastValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CommentDTO, MessageDTO, PostDetailDTO, PostDTO, UniversityDTO } from '../dto';

@Injectable()
export class PostService {
	constructor(private http: HttpService) {}

	public getUniversity(): Observable<UniversityDTO[]> {
		return this.http
			.get<UniversityDTO[]>(`${process.env['REST_ENDPOINTS_UNIVERSITIES']}/search?country=chile`)
			.pipe(map((response) => response.data));
	}

	public getPosts(): Observable<PostDTO[]> {
		return this.http.get<PostDTO[]>(`${process.env['REST_ENDPOINTS_JSONPLACEHOLDER']}/posts`).pipe(map((response) => response.data));
	}
	public async getPostById(id: number): Promise<PostDTO> {
		const post = this.http.get<PostDTO>(`${process.env['REST_ENDPOINTS_JSONPLACEHOLDER']}/posts/${id}`).pipe(map((response) => response.data));
		return lastValueFrom(post);
	}

	public getCommentsById(id: number): Promise<CommentDTO[]> {
		const comments = this.http
			.get<CommentDTO[]>(`${process.env['REST_ENDPOINTS_JSONPLACEHOLDER']}/posts/${id}/comments`)
			.pipe(map((response) => response.data));
		return lastValueFrom(comments);
	}

	public async getPostByIdWithComments(id: number): Promise<PostDetailDTO> {
		const post = await this.getPostById(id);
		const comments = await this.getCommentsById(id);
		return { ...post, comments };
	}

	public getPostsWithUniversities(): Observable<MessageDTO> {
		const universities = this.getUniversity();
		const posts = this.getPosts();
		return forkJoin({ universities, posts });
	}
}
