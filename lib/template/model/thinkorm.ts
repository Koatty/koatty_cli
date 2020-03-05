/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2020-01-07 09:56:04
 */
import { BaseModel, Entity, PrimaryColumn, Column } from "thinkorm";
import { Component, Value } from 'koatty';
import { App } from '<Path>/App';

@Component()
@Entity('<ModelName>')
export class <ClassName> extends BaseModel {
    app: App;

    @Value("database", "db")
    config: any;

    @PrimaryColumn()
    id: number;

    @Column(20, '', true, true)
    name: string;
}